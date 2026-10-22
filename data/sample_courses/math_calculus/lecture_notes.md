# MATH 301 Lecture Notes — Module 1 & 2
**Course:** Multivariable Calculus • **Author:** Prof. S. Kapoor  

---

## Lecture 4: Integration by Parts & The Common Distribution Trap

### 1. Theoretical Foundation
The integration by parts formula is derived from the product rule of differentiation:
$$\frac{d}{dx}[u(x)v(x)] = u'(x)v(x) + u(x)v'(x)$$

Integrating both sides yields the master formula:
$$\int u \, dv = uv - \int v \, du$$

### 2. The Golden Choice Rule (LIATE Priority)
Choose $u$ in order of precedence:
1. **L**ogarithmic ($\ln x$)
2. **I**nverse Trigonometric ($\arctan x$)
3. **A**lgebraic ($x^n, x$)
4. **T**rigonometric ($\cos x, \sin x$)
5. **E**xponential ($e^x$)

---

### ⚠️ Common Cognitive Pitfall: The Minus-Sign Distribution Error
When evaluating integrals of the form:
$$\int x \cos(2x) \, dx$$

#### Step-by-Step Rigorous Solution:
1. **Choose Parts:**
   * $u = x \implies du = dx$
   * $dv = \cos(2x) \, dx \implies v = \int \cos(2x) \, dx = \frac{1}{2}\sin(2x)$

2. **Apply the Formula:**
   $$\int x \cos(2x) \, dx = x \cdot \left(\frac{1}{2}\sin(2x)\right) - \int \left(\frac{1}{2}\sin(2x)\right) \, dx$$
   $$= \frac{1}{2}x\sin(2x) - \frac{1}{2}\int \sin(2x) \, dx$$

3. **The Trap Point:**
   Notice that $\int \sin(2x) \, dx = -\frac{1}{2}\cos(2x)$.  
   Therefore:
   $$- \frac{1}{2}\left(-\frac{1}{2}\cos(2x)\right) = +\frac{1}{4}\cos(2x)$$

4. **Final Complete Answer:**
   $$= \frac{1}{2}x\sin(2x) + \frac{1}{4}\cos(2x) + C$$

> **Professor's Warning Note (Slide 14):**  
> *"Over 45% of students lose marks here by failing to carry the outer negative sign across the integration of sine, writing $-\frac{1}{4}\cos(2x)$ instead of $+\frac{1}{4}\cos(2x)$."*

---

## Lecture 9: First-Order Linear Differential Equations & Integrating Factors

### Standard Form:
$$\frac{dy}{dx} + P(x)y = Q(x)$$

### Solution Method:
1. Identify $P(x)$ and $Q(x)$.
2. Calculate the Integrating Factor:
   $$\mu(x) = e^{\int P(x) \, dx}$$
3. Multiply throughout:
   $$\frac{d}{dx}[\mu(x)y] = \mu(x)Q(x)$$
4. Integrate both sides:
   $$y(x) = \frac{1}{\mu(x)}\left[\int \mu(x)Q(x) \, dx + C\right]$$
