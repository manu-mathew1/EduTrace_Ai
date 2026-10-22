# ECON 202 Lecture Notes — Modules 1, 2, & 3
**Course:** Intermediate Macroeconomics • **Author:** Prof. M. Taylor  

---

## --- Slide 8: The Keynesian Cross & The Multiplier with Proportional Taxation
### 1. Model Setup
Aggregate Planned Expenditure is given by:
$$PE = C + I + G + NX$$
Where consumption depends on disposable income:
$$C = C_0 + c_1(Y - T)$$
With proportional income taxation:
$$T = t \cdot Y \implies Y_d = (1 - t)Y$$

### 2. Derivation of Equilibrium Output
At equilibrium: $Y = PE$
$$Y = C_0 + c_1(1 - t)Y + \bar{I} + \bar{G}$$
Grouping $Y$ terms on the left:
$$Y[1 - c_1(1 - t)] = C_0 + \bar{I} + \bar{G}$$
$$Y^* = \frac{1}{1 - c_1(1 - t)} \cdot (C_0 + \bar{I} + \bar{G})$$

The government purchases multiplier is:
$$\frac{\Delta Y}{\Delta G} = \frac{1}{1 - c_1(1 - t)}$$

> **Professor's Warning Note (Slide 8):**  
> *"Common Cognitive Trap: Over 40% of students in past exams used the simple multiplier $\frac{1}{1 - c_1}$ when taxes are proportional, forgetting the tax drag factor $(1 - t)$. For $c_1 = 0.8$ and $t = 0.25$, the simple multiplier gives 5.0, whereas the true multiplier is only $\frac{1}{1 - 0.8(0.75)} = \frac{1}{1 - 0.6} = 2.5$! Neglecting $(1 - t)$ leads to a 100% overestimation of fiscal stimulus impact."*

---

## --- Slide 15: The IS-LM Framework & The Crowding-Out Mechanism
### 1. The Goods Market (IS Curve)
The IS curve traces all combinations of interest rate $r$ and output $Y$ where planned expenditure equals actual output:
$$Y = C(Y - T) + I(r) + G$$
Since investment is negatively related to the real interest rate ($\frac{dI}{dr} < 0$), the IS curve is downward sloping.

### 2. The Money Market (LM Curve)
The LM curve traces combinations of $r$ and $Y$ where real money demand equals real money supply:
$$\frac{M}{P} = L(r, Y) = kY - hr$$
Since money demand increases with output $Y$ and decreases with interest rate $r$, the LM curve is upward sloping.

### 3. Fiscal Expansion & The Crowding-Out Trap
An increase in government purchases ($\Delta G > 0$) shifts the IS curve rightward by $\frac{1}{1 - c_1(1 - t)} \Delta G$.
However, the final equilibrium output increase is strictly smaller than the horizontal IS shift:
$$\Delta Y_{final} < \Delta Y_{IS\_shift}$$

> **Professor's Warning Note (Slide 15):**  
> *"Pitfall Alert: An increase in $G$ raises aggregate output, which increases the transaction demand for money. In an unchanged money supply $\frac{M}{P}$, this money market pressure drives the interest rate $r$ up. The higher interest rate reduces interest-sensitive private investment $I(r)$. This is the Crowding-Out Effect. Never claim that output increases by the full multiplier in the IS-LM framework unless the central bank accommodates with monetary expansion."*

---

## --- Slide 18: The Zero Lower Bound & Liquidity Trap
### 1. Extreme Case: Liquidity Trap
When the nominal interest rate approaches zero ($r \to 0$), real money demand becomes infinitely interest-elastic ($h \to \infty$).
The LM curve becomes completely horizontal at the zero lower bound.

### 2. Policy Implication
At the liquidity trap:
1. Conventional monetary expansion ($\Delta M > 0$) cannot lower $r$ further; it is completely ineffective at stimulating output.
2. Fiscal expansion ($\Delta G > 0$) experiences **ZERO crowding-out** because $r$ does not rise. The fiscal multiplier operates at its full Keynesian cross strength!

> **Professor's Warning Note (Slide 18):**  
> *"Slide 18 Checkpoint: In a liquidity trap, monetary policy is impotent ('pushing on a string'), but fiscal policy has maximum potency. Do not apply conventional crowding-out logic when $r = 0$."*

---

## --- Slide 24: Aggregate Supply Shocks & The Stagflation Policy Dilemma
### 1. Short-Run Aggregate Supply (SRAS)
SRAS is upward sloping due to sticky wages or misperceptions:
$$P = P^e + \lambda(Y - \bar{Y})$$

### 2. Adverse Supply Shock
An unexpected oil price surge or supply chain rupture shifts the SRAS curve upward/leftward:
$$\text{Cost of Production} \uparrow \implies SRAS \text{ shifts Leftward}$$

### 3. The Stagflation Outcome
At the new short-run equilibrium:
- The price level rises: $P \uparrow$ (Inflation)
- Real output contracts: $Y \downarrow$ (Unemployment rises)
This dual disaster is **Stagflation**.

> **Professor's Warning Note (Slide 24):**  
> *"Critical Warning: You cannot solve a supply shock using standard demand-management tools without trade-offs. Stimulating demand shifts AD right, restoring $Y$ but worsening inflation. Restricting demand lowers $P$ but deepens recession. Always distinguish between demand-side and supply-side root causes before recommending policy interventions."*
