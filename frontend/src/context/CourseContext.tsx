import React, { createContext, useContext, useState, useEffect } from 'react';
import { CourseResponse, CourseCreate, KnowledgeArchetype } from '../types/schema';
import { useAuth } from './AuthContext';

interface CourseContextType {
  courses: CourseResponse[];
  activeCourse: CourseResponse | null;
  activeCourseId: string;
  setActiveCourseId: (courseId: string) => void;
  createNewCourse: (
    title: string,
    subjectArchetype?: KnowledgeArchetype,
    targetScore?: number,
    examDate?: string
  ) => Promise<CourseResponse | null>;
  calibrateActiveCourse: () => Promise<void>;
  isLoadingCourses: boolean;
  refreshCourses: () => Promise<void>;
}

const CourseContext = createContext<CourseContextType | undefined>(undefined);

const getInitialCoursesForUser = (user: any): CourseResponse[] => {
  if (!user) return [];
  if (user.id === 'std_rahul_99') {
    return [
      {
        course_id: 'course_calc_301',
        title: 'Calculus III: Multivariable & Advanced Integration',
        subject_archetype: KnowledgeArchetype.PROCEDURAL,
        target_score: 75,
        current_baseline: 50,
        target_exam_date: '2026-10-28',
        created_at: new Date().toISOString(),
        user_id: 'std_rahul_99',
        is_calibrated: true,
      },
    ];
  }
  if (user.id === 'std_priya_88') {
    return [
      {
        course_id: 'course_econ_202',
        title: 'ECON 202: Intermediate Macroeconomics',
        subject_archetype: KnowledgeArchetype.CONCEPTUAL,
        target_score: 80,
        current_baseline: 55,
        target_exam_date: '2026-11-12',
        created_at: new Date().toISOString(),
        user_id: 'std_priya_88',
        is_calibrated: true,
      },
    ];
  }
  if (user.id === 'std_alex_77') {
    return [
      {
        course_id: 'course_cs_210',
        title: 'CS 210: Data Structures & Algorithms',
        subject_archetype: KnowledgeArchetype.PROCEDURAL,
        target_score: 85,
        current_baseline: 60,
        target_exam_date: '2026-11-04',
        created_at: new Date().toISOString(),
        user_id: 'std_alex_77',
        is_calibrated: true,
      },
    ];
  }
  return [];
};

export const CourseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  const [courses, setCourses] = useState<CourseResponse[]>(() => {
    return getInitialCoursesForUser(user);
  });
  const [activeCourseId, setActiveCourseIdState] = useState<string>(() => {
    if (user?.id === 'std_rahul_99') {
      return localStorage.getItem('edutrace_active_course') || 'course_calc_301';
    }
    if (user?.id === 'std_priya_88') {
      return localStorage.getItem('edutrace_active_course') || 'course_econ_202';
    }
    if (user?.id === 'std_alex_77') {
      return localStorage.getItem('edutrace_active_course') || 'course_cs_210';
    }
    return user?.primary_course_id || localStorage.getItem('edutrace_active_course') || '';
  });
  const [isLoadingCourses, setIsLoadingCourses] = useState<boolean>(true);

  const fetchCourses = async () => {
    try {
      if (!user?.id) {
        setCourses([]);
        setActiveCourseIdState('');
        return;
      }

      const token = localStorage.getItem('edutrace_token');
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const url = `/api/courses?user_id=${encodeURIComponent(user.id)}`;
      const res = await fetch(url, { headers });
      if (res.ok) {
        const data: CourseResponse[] = await res.json();
        if (Array.isArray(data)) {
          // Strictly filter to ensure only courses belonging to this student are displayed
          const studentCourses = data.filter((c) => {
            if (c.user_id) return c.user_id === user.id;
            if (user.id === 'std_rahul_99') return c.course_id === 'course_calc_301';
            if (user.id === 'std_priya_88') return c.course_id === 'course_econ_202' || c.course_id === 'course_econ_macro';
            if (user.id === 'std_alex_77') return c.course_id === 'course_cs_210';
            return false;
          });

          setCourses(studentCourses);
          if (studentCourses.length > 0) {
            const saved = localStorage.getItem('edutrace_active_course');
            if (saved && studentCourses.some((c) => c.course_id === saved)) {
              setActiveCourseIdState(saved);
            } else {
              setActiveCourseIdState(studentCourses[0].course_id);
            }
          } else {
            setActiveCourseIdState('');
          }
          return;
        }
      }
    } catch (e) {
      console.warn('Using baseline courses:', e);
    } finally {
      setIsLoadingCourses(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) {
      const initial = getInitialCoursesForUser(user);
      if (initial.length > 0) {
        setCourses((prev) => {
          const belongsToCurrent = prev.every((c) => !c.user_id || c.user_id === user.id);
          return belongsToCurrent && prev.length > 0 ? prev : initial;
        });
      }
    } else {
      setCourses([]);
      setActiveCourseIdState('');
    }
  }, [user?.id]);

  // When user switches persona or logs in, sync active course if user has a primary_course_id
  useEffect(() => {
    if (user?.primary_course_id) {
      const saved = localStorage.getItem('edutrace_active_course');
      if (!saved) {
        setActiveCourseIdState(user.primary_course_id);
      }
    }
  }, [user?.id, user?.primary_course_id]);

  const setActiveCourseId = (courseId: string) => {
    setActiveCourseIdState(courseId);
    try {
      if (courseId) {
        localStorage.setItem('edutrace_active_course', courseId);
      } else {
        localStorage.removeItem('edutrace_active_course');
      }
    } catch {}
  };

  const calibrateActiveCourse = async () => {
    if (!activeCourseId) return;
    try {
      const res = await fetch(`/api/courses/${encodeURIComponent(activeCourseId)}/calibrate`, {
        method: 'POST',
      });
      if (res.ok) {
        const updated: CourseResponse = await res.json();
        setCourses((prev) => prev.map((c) => (c.course_id === updated.course_id ? updated : c)));
      }
    } catch (e) {
      console.warn('Calibration sync failed:', e);
    }
  };

  const createNewCourse = async (
    title: string,
    subjectArchetype: KnowledgeArchetype = KnowledgeArchetype.PROCEDURAL,
    targetScore: number = 75,
    examDate?: string
  ): Promise<CourseResponse | null> => {
    try {
      const payload: CourseCreate = {
        title,
        subject_archetype: subjectArchetype,
        target_score: targetScore,
        current_baseline: 50,
        target_exam_date: examDate || '2026-11-15',
        user_id: user?.id,
        is_calibrated: false,
      };

      const token = localStorage.getItem('edutrace_token');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const url = user?.id ? `/api/courses?user_id=${encodeURIComponent(user.id)}` : '/api/courses';
      const res = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const created: CourseResponse = await res.json();
        setCourses((prev) => [created, ...prev.filter((c) => c.course_id !== created.course_id)]);
        setActiveCourseId(created.course_id);
        return created;
      }
    } catch (e) {
      console.error('Failed to create course:', e);
    }

    // Client fallback if offline
    const fallbackId = `course_${title.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 16)}_${Date.now().toString(36)}`;
    const syntheticCourse: CourseResponse = {
      course_id: fallbackId,
      title,
      subject_archetype: subjectArchetype,
      target_score: targetScore,
      current_baseline: 50,
      target_exam_date: examDate || '2026-11-15',
      created_at: new Date().toISOString(),
      user_id: user?.id,
      is_calibrated: false,
    };
    setCourses((prev) => [syntheticCourse, ...prev]);
    setActiveCourseId(fallbackId);
    return syntheticCourse;
  };

  const activeCourse = courses.find((c) => c.course_id === activeCourseId) || (courses.length > 0 ? courses[0] : null);

  return (
    <CourseContext.Provider
      value={{
        courses,
        activeCourse,
        activeCourseId,
        setActiveCourseId,
        createNewCourse,
        calibrateActiveCourse,
        isLoadingCourses,
        refreshCourses: fetchCourses,
      }}
    >
      {children}
    </CourseContext.Provider>
  );
};

export const useCourses = () => {
  const context = useContext(CourseContext);
  if (!context) {
    throw new Error('useCourses must be used within a CourseProvider');
  }
  return context;
};
