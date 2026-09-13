# LabourLink — Two-Sided Digital Labour Marketplace & Operations Platform

> Built in accordance with the complete 107-page business blueprint, encompassing all business models, architectural layers, mathematical formulas, matching algorithms, escrow money flows, 7-stage onboarding, dispute resolution systems, unit economics, and legal frameworks.

---

## 🌟 Architecture & Blueprint Mapping

| PDF Section | Core Features & Implementation | Location in App |
| :--- | :--- | :--- |
| **1. Business Model (pp. 1-6)** | Two-Sided Aggregator model, asset-light, independent contractor classification (no PF/ESI liabilities), 4 model variants (On-Demand, Scheduled, B2B Contract, Managed Workforce). | Top Navigation, Global Banner, [LegalView](file:///c:/Users/shiva/OneDrive/Desktop/LabourLink/js/views/legalView.js) |
| **2. Stakeholders (pp. 7-19)** | 12 Stakeholder personas mapped: Demand, Supply, Operations, Support, B2B, Founders, Payment Gateway, Insurance, Legal. | Role Switcher in Navigation |
| **3. Labour Categorization (pp. 20-26)** | 4 Tiers: Unskilled, Semi-Skilled, Skilled, Specialist. Experience levels (Beginner, Intermediate, Expert). Commission slabs (10-25%). | [matchingEngine.js](file:///c:/Users/shiva/OneDrive/Desktop/LabourLink/js/matchingEngine.js) & [pricingEngine.js](file:///c:/Users/shiva/OneDrive/Desktop/LabourLink/js/pricingEngine.js) |
| **4. Pricing & Commission (pp. 27-33)** | Hourly/Daily/Fixed formulas, dynamic & emergency surge (1.25×), platform fee, 18% GST calculation, cancellation penalty matrix (>6h, 2-6h, <2h). | [pricingEngine.js](file:///c:/Users/shiva/OneDrive/Desktop/LabourLink/js/pricingEngine.js) & [customerView.js](file:///c:/Users/shiva/OneDrive/Desktop/LabourLink/js/views/customerView.js) |
| **5. Escrow & Money Flow (pp. 34-40)** | Upfront collection into virtual escrow, Start OTP release lock, commission deduction, partial work hour refund recalculation, dispute freeze. | [escrowEngine.js](file:///c:/Users/shiva/OneDrive/Desktop/LabourLink/js/escrowEngine.js) |
| **6. 7-Stage Onboarding (pp. 41-47)** | 1. Phone + OTP $\rightarrow$ 2. KYC Upload $\rightarrow$ 3. Skill MCQ Test $\rightarrow$ 4. Safety Checks $\rightarrow$ 5. Legal Safe Harbor Contract $\rightarrow$ 6. Video Training $\rightarrow$ 7. Activation Badge. | [labourView.js](file:///c:/Users/shiva/OneDrive/Desktop/LabourLink/js/views/labourView.js) |
| **7. Matching Algorithm (pp. 48-54)** | Multi-factor mathematical formula: Distance (25%) + Availability (20%) + Rating (20%) + Completion (15%) + Acceptance (10%) + Experience (10%). Anti-bias >5 jobs today rule (-20%). | [matchingEngine.js](file:///c:/Users/shiva/OneDrive/Desktop/LabourLink/js/matchingEngine.js) & [operationsView.js](file:///c:/Users/shiva/OneDrive/Desktop/LabourLink/js/views/operationsView.js) |
| **8. Customer Booking (pp. 55-62)** | 18-step booking journey: Discovery, transparent quote, escrow checkout, worker card with masked phone, live GPS tracking, Start OTP, active timer, tax invoice, rating. | [customerView.js](file:///c:/Users/shiva/OneDrive/Desktop/LabourLink/js/views/customerView.js) |
| **9. Dispute Resolution (pp. 63-70)** | SLA-driven workbench (No-show: Instant, Safety: Immediate, Payment: 24h, Quality: 48h). Evidence locker (GPS, timestamps, photos), escrow freeze, and resolution decisions. | [operationsView.js](file:///c:/Users/shiva/OneDrive/Desktop/LabourLink/js/views/operationsView.js) |
| **10. Rating & Penalties (pp. 71-77)** | Weighted formula: (Last 10 × 50%) + (Prev 20 × 30%) + (Overall × 20%). Progressive penalty tiers (Level 1 Warning to Level 4 Ban). Labour appeal workflow. | [ratingPenaltyEngine.js](file:///c:/Users/shiva/OneDrive/Desktop/LabourLink/js/ratingPenaltyEngine.js) |
| **11. Economics & Cost (pp. 78-92)** | Unit economics per ₹1,000 booking: ₹250 Rev, ₹55 Variable Cost, ₹195 Net (78% Margin). Interactive Break-Even calculator & LTV/CAC ratio model. | [executiveView.js](file:///c:/Users/shiva/OneDrive/Desktop/LabourLink/js/views/executiveView.js) |
| **12. Retention & Loyalty (pp. 100-105)** | Bronze/Silver/Gold tiers, non-withdrawable cashback wallet, 1-click "Book Again" favourite worker rehire. | [customerView.js](file:///c:/Users/shiva/OneDrive/Desktop/LabourLink/js/views/customerView.js) |
| **13. Executive KPIs (pp. 106-107)** | Cost per booking, Labour utilization rate, Customer repeat rate (>40%), Cancellation %, AOV, Monthly active labour. | [executiveView.js](file:///c:/Users/shiva/OneDrive/Desktop/LabourLink/js/views/executiveView.js) |

---

## 🚀 Running the Application Locally

The application runs on a lightweight zero-dependency Node.js HTTP server.

```bash
# Start the local server
node server.js
```
Then open your browser and navigate to:
**`http://localhost:3000`**

To run the automated verification test suite:
```bash
node test_engines.js
```

---

## 🎮 Interactive Test Scenarios Menu

Click **"Run Test Scenarios"** in the top navigation bar to test the blueprints directly:
1. **Instant Electrician Booking**: Automatic selection, transparent price quote, escrow lock modal, worker assignment, and start OTP verification.
2. **7-Stage Labour Onboarding**: Explore the 7 stages with KYC review, trade skill MCQ assessment, and non-employment legal e-sign.
3. **Dispute & Escrow Freeze**: Inspect active SLA disputes, locked funds, and execute customer refund or split settlement.
4. **Anti-Bias & Job Monopoly Rule**: Test the formula with a worker having >5 jobs completed today, verifying the -20% score penalty.
5. **₹1,000 Booking Unit Economics**: Inspect exact contribution margins (₹250 Rev / ₹55 Cost / ₹195 Net / 78% Margin) and adjust the Break-Even slider.
