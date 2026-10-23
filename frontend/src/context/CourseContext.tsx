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
  isLoadingCourses: boolean;
  refreshCourses: () => Promise<void>;
}

const CourseContext = createContext<CourseContextType | undefined>(undefined);

const DEFAULT_COURSES: CourseResponse[] = [
  {
    course_id: 'course_calc_301',
    title: 'Calculus III: Multivariable & Advanced Integration',
    subject_archetype: KnowledgeArchetype.PROCEDURAL,
    target_score: 75,
    current_baseline: 50,
    target_exam_date: '2026-10-28',
    created_at: new Date().toISOString(),
  },
  {
    course_id: 'course_cs_210',
    title: 'CS 210: Data Structures & Algorithms',
    subject_archetype: KnowledgeArchetype.PROCEDURAL,
    target_score: 85,
    current_baseline: 60,
    target_exam_date: '2026-11-04',
    created_at: new Date().toISOString(),
  },
  {
    course_id: 'course_econ_202',
    title: 'ECON 202: Intermediate Macroeconomics',
    subject_archetype: KnowledgeArchetype.CONCEPTUAL,
    target_score: 80,
    current_baseline: 55,
    target_exam_date: '2026-11-12',
    created_at: new Date().toISOString(),
  },
];

export const CourseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<CourseResponse[]>(DEFAULT_COURSES);
  const [activeCourseId, setActiveCourseIdState] = useState<string>(() => {
    return localStorage.getItem('edutrace_active_course') || 'course_calc_301';
  });
  const [isLoadingCourses, setIsLoadingCourses] = useState<boolean>(true);

  const fetchCourses = async () => {
    try {
      const res = await fetch('/api/courses');
      if (res.ok) {
        const data: CourseResponse[] = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setCourses(data);
          // If activeCourseId is not in list, keep it or fallback
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
  }, []);

  // When user switches persona or logs in, sync active course if user has a primary_course_id
  useEffect(() => {
    if (user?.primary_course_id) {
      const saved = localStorage.getItem('edutrace_active_course');
      // If no manually saved course, use user's default
      if (!saved) {
        setActiveCourseIdState(user.primary_course_id);
      }
    }
  }, [user?.id, user?.primary_course_id]);

  const setActiveCourseId = (courseId: string) => {
    setActiveCourseIdState(courseId);
    try {
      localStorage.setItem('edutrace_active_course', courseId);
    } catch {}
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
      };

      const res = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
    };
    setCourses((prev) => [syntheticCourse, ...prev]);
    setActiveCourseId(fallbackId);
    return syntheticCourse;
  };

  const activeCourse = courses.find((c) => c.course_id === activeCourseId) || courses[0] || null;

  return (
    <CourseContext.Provider
      value={{
        courses,
        activeCourse,
        activeCourseId,
        setActiveCourseId,
        createNewCourse,
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
