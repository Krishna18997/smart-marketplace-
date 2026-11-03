# SMART STUDENT MARKETPLACE

> **Third-Year Computer Science Engineering Capstone & Problem Statement Prototype**  
> An explainable, budget-aware second-hand marketplace combining mathematical multi-factor product ranking, price intelligence, dynamic buyer priorities, within-category price anomaly detection, and missing-data resilience.

---

## 1. Project Overview

Students frequently buy second-hand electronics, textbooks, bicycles, and gadgets on campus, yet struggle to ascertain whether a listing price is fair and what trade-offs they are making between price, equipment age, and physical condition. 

**Smart Student Marketplace** solves this through a transparent, mathematical recommendation and anomaly-detection engine. Rather than relying on opaque AI black-boxes or hardcoded mock suggestions, the application implements documented equations that evaluate every listing against student constraints, detects statistical price outliers, and explains the reasoning behind each recommendation.

---

## 2. Problem Statement Scenario

* A student seeks to purchase a second-hand laptop with a strict maximum budget of **₹23,000**.
* Multiple laptops are available at varying prices, usage ages, and physical conditions:
  * **Laptop A**: ₹22,000 | Age: 2 yrs | Condition: Good | Original: ₹45,000
  * **Laptop B**: ₹18,000 | Age: 3 yrs | Condition: Average | Original: ₹42,000
  * **Laptop C**: ₹25,000 | Age: 1 yr | Condition: Excellent | Original: ₹48,000
  * **Laptop D**: ₹20,000 | Age: 2 yrs | Condition: Good | Original: ₹40,000
  * **Laptop E**: ₹15,000 | Age: 4 yrs | Condition: Average | Original: ₹38,000
* **Challenge**: 
  1. Eliminate **Laptop C** immediately because its price (₹25,000) exceeds the student's budget (₹23,000).
  2. Compute mathematically accurate affordability, age decay, and condition scores for eligible candidates.
  3. Rank the top 3 recommendations dynamically according to the student's priorities (Balanced, Affordability-First, or Condition-First).
  4. Flag price anomalies within categories without making fraudulent claims.

---

## 3. Technology Stack

* **Frontend Framework**: React 19 + TypeScript (strict mode)
* **Styling & Design System**: Tailwind CSS v4 with bespoke Scandinavian editorial design palette (`#F7F5F0` Warm Ivory, `#EAE3D8` Soft Beige, `#252722` Charcoal Black, `#426B55` Emerald Green)
* **Typography**: Newsreader (editorial serif for headlines) & DM Sans (body & tabular numbers)
* **Data Storage**: LocalStorage with schema validation, seed data hydration, and JSON/CSV import/export
* **Testing**: Node.js built-in test runner (`node:test`, `node:assert/strict`) via `npx tsx --test`
* **Build Tooling**: Vite 8

---

## 4. Mathematical Ranking Algorithm

The ranking algorithm produces an objective composite score between **0 and 100** for every eligible listing.

### Step 1: Strict Budget Eligibility
$$\text{Eligible} = (\text{Current Price} \le \text{Budget}) \land (\text{Current Price} > 0)$$
Products exceeding the buyer's maximum budget or with missing/negative prices are disqualified before ranking calculations begin.

### Step 2: Price Score (Affordability)
Measures relative financial savings beneath the budget ceiling:
$$\text{Price Score} = \text{Clamp}_{0}^{100}\left( \frac{\text{Budget} - \text{Current Price}}{\text{Budget}} \times 100 \right)$$
* *Example (Budget = ₹23,000, Laptop A = ₹22,000)*:
  $$\text{Price Score} = \frac{23,000 - 22,000}{23,000} \times 100 = 4.35$$
* *Example (Laptop B = ₹18,000)*:
  $$\text{Price Score} = \frac{23,000 - 18,000}{23,000} \times 100 = 21.74$$
* A product priced exactly at the budget receives a score of **0**.

### Step 3: Age Score (Hardware Decay)
Rewards newer products using a configurable maximum reference age (default $M = 5$ years):
$$\text{Age Score} = \text{Clamp}_{0}^{100}\left( \frac{\text{MaxRefAge} - \text{Product Age}}{\text{MaxRefAge}} \times 100 \right)$$
* *Example (MaxRefAge = 5, Laptop A Age = 2)*:
  $$\text{Age Score} = \frac{5 - 2}{5} \times 100 = 60.00$$
* *Example (Laptop C Age = 1)*:
  $$\text{Age Score} = \frac{5 - 1}{5} \times 100 = 80.00$$
* Items older than 5 years receive a score of **0**.

### Step 4: Condition Score Mapping
Case-insensitive and whitespace-trimmed categorical mapping:
* **Excellent** = $100$
* **Good** = $75$
* **Average** = $50$
* **Poor** = $25$

---

## 5. Dynamic Buyer Priority Modes

The final score is computed as a weighted sum:
$$\text{Final Score} = (\text{Price Score} \times W_P) + (\text{Age Score} \times W_A) + (\text{Condition Score} \times W_C)$$

| Priority Mode | Price Weight ($W_P$) | Age Weight ($W_A$) | Condition Weight ($W_C$) | Use Case |
| :--- | :---: | :---: | :---: | :--- |
| **Balanced (Default)** | **50%** (0.50) | **20%** (0.20) | **30%** (0.30) | Optimal balance across all attributes |
| **Affordability First** | **70%** (0.70) | **10%** (0.10) | **20%** (0.20) | Maximum cash savings; elevates Laptop E |
| **Condition First** | **20%** (0.20) | **10%** (0.10) | **70%** (0.70) | Highest cosmetic & functional quality |
| **Custom Sliders** | User defined | User defined | User defined | Manual fine-tuning (normalized to 100%) |

---

## 6. Missing Value Handling & Dynamic Weight Renormalization

When a seller omits an optional attribute (such as condition or usage age), the algorithm **does not penalize** the listing by assuming a zero score. Instead, it dynamically renormalizes available weights:

$$\text{Adjusted Score} = \frac{\sum (\text{Available Factor Score} \times \text{Original Factor Weight})}{\sum \text{Available Factor Weights}}$$

* **Case 1: Missing Condition**:
  $$\text{Adjusted Score} = \frac{\text{Price Score} \times 0.50 + \text{Age Score} \times 0.20}{0.50 + 0.20} = \frac{\text{Price Score} \times 0.50 + \text{Age Score} \times 0.20}{0.70}$$
* **Case 2: Missing Age**:
  $$\text{Adjusted Score} = \frac{\text{Price Score} \times 0.50 + \text{Condition Score} \times 0.30}{0.80}$$
* **Transparency**: The UI marks the score as **"Renormalized"**, lists the unavailable factors, and displays an exact Data Completeness % indicator (e.g. 67% or 100%).

---

## 7. Deterministic Tie-Breaking Cascade

If two or more eligible items produce identical final scores within a mathematical tolerance of $0.001$:
1. **Tier 1**: Prefer the lower listing price (maximizes direct student savings).
2. **Tier 2**: Prefer the younger product (lower age).
3. **Tier 3**: Alphabetical title sorting (ensures deterministic output).
4. A visible **"(tie)"** indicator notifies the buyer that identical mathematical scores were resolved deterministically.

---

## 8. Price Intelligence & Within-Category Anomaly Detection

### Price-to-Original-Price Ratio
$$\text{Price Ratio (\%)} = \left(\frac{\text{Current Price}}{\text{Original Price}}\right) \times 100$$

### Student Discount Calculation
$$\text{Discount Amount} = \text{Original Price} - \text{Current Price}$$
$$\text{Discount (\%)} = \left(\frac{\text{Original Price} - \text{Current Price}}{\text{Original Price}}\right) \times 100$$

### Within-Category Price Anomaly Rule
1. Compute the **Median Price** ($M_{cat}$) of all positive-priced listings in that specific category:
   * Odd count $n$: Middle sorted value.
   * Even count $n$: Average of the two middle values.
2. Calculate percentage deviation:
   $$\text{Price Deviation (\%)} = \frac{|\text{Current Price} - M_{cat}|}{M_{cat}} \times 100$$
3. Listings with deviation exceeding **50%** (configurable 20%–100%) are flagged as **Unusually Priced** (High or Low).
4. **Prerequisite**: Requires at least **3 comparable listings** in the category. If fewer than 3 exist, the system safely reports *"Insufficient comparable listings"*.
5. **Educational Disclaimer**: *"An unusual price indicates a significant deviation from comparable listings in the same category. It is a signal for further checking, not evidence of fraud."* Flagged items are never hidden or censored.

---

## 9. Running and Testing the Application

### Running the Web Application
```bash
# Install dependencies
npm install

# Start Vite dev server on port 3000
npm run dev

# Build for production
npm run build
```

### Running Unit Tests (Node Test Runner)
```bash
npx --yes tsx --test src/utils/logic.test.ts
```
The test suite validates:
1. Exact mathematical examples from Problem Statement §8 (Laptop A, B, C, D, E).
2. Affordability, age, and condition score clamps.
3. Dynamic priority ranking shifts.
4. Dynamic weight renormalization for missing fields.
5. Median calculation for odd & even arrays.
6. Anomaly threshold triggers.
7. CSV and JSON column-mapping normalization.

---

## 10. Evaluation Criteria Mapping (100 Points)

| Rubric Section | Points | Implementation Highlights in Smart Student Marketplace |
| :--- | :---: | :--- |
| **A. Marketplace Core Features** | **25 pts** | LocalStorage persistence, real-time case-insensitive search, dynamic category pills, max budget filter, sorting, CRUD modal, responsive grid. |
| **B. Price Analysis & Anomaly Rule** | **25 pts** | Price-to-original ratio %, discount %, category median (even/odd), deviation %, 50% threshold, $\ge 3$ comparables rule, educational notice. |
| **C. Ranking Algorithm** | **25 pts** | Strict budget cutoff, price score, age score, condition score, dynamic buyer weights (Balanced / Affordability / Condition / Custom), Top 3 podium, data-driven explanations. |
| **D. Edge-Case Handling & Reasoning** | **15 pts** | Missing values without crashes, weight renormalization, negative price prevention, identical scores, sparse categories, column normalizer ("item", "currentPrice", etc.). |
| **E. Usability & Explanation** | **10 pts** | Editorial Scandinavian aesthetic, Newsreader + DM Sans typography, accessible forms, transparent formula guides, zero AI slop clutter. |
