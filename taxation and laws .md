# STUDIO MYSTRI  
# INDIA COMPLIANCE & AUDIT GOVERNANCE DOCUMENT  
(BMS + eCommerce + Finance + Inventory)

---

# PURPOSE

This document defines all mandatory Indian legal compliance requirements applicable to Studio Mystri, operating:

- BMS (Business Management System)
- eCommerce platform
- Invoicing
- Razorpay Payments
- Inventory management
- Finance & Accounting

This excludes payroll and labour compliance modules.

The objective is to ensure:

- GST compliance
- Income Tax compliance
- Companies Act compliance
- Payment reconciliation integrity
- Audit readiness
- Financial transparency
- Inventory traceability

If the BMS cannot generate these records instantly, the business is exposed to audit risk.

---

# 🇮🇳 1️⃣ GST (GOODS & SERVICES TAX) – MANDATORY RECORDS

## Mandatory Books Under GST Law (Section 35)

The system must maintain:

### Sales Records
- Tax Invoices (B2B & B2C)
- Bill of Supply (if applicable)
- Debit Notes
- Credit Notes

### Purchase Records
- Purchase invoices
- Reverse charge records (if applicable)

### Output & Input Tax Records
- Output GST collected
- Input Tax Credit (ITC) claimed
- ITC reversals

### Stock Register (Mandatory)
- Opening stock
- Purchases
- Sales
- Closing stock
- Wastage (if any)
- Returns

Stock reconciliation must be producible at any time.

---

## Mandatory GST Returns

The system must support data required for:

- GSTR-1 (Outward supplies)
- GSTR-3B (Monthly summary)
- GSTR-9 (Annual return)
- GSTR-9C (if turnover threshold applicable)

All invoice data must reconcile with GSTR filings.

---

# 🧾 2️⃣ INCOME TAX ACT – BOOKS OF ACCOUNT

Under Section 44AA:

The BMS must maintain:

- General Ledger
- Cash Book
- Bank Book
- Sales Register
- Purchase Register
- Journal Entries
- Fixed Asset Register
- Depreciation Register

If audited, the system must generate:

- Trial Balance
- Profit & Loss Statement
- Balance Sheet
- Cash Flow Statement

Retention requirement: Minimum 8 years.

---

# 🏢 3️⃣ COMPANIES ACT (If Pvt Ltd)

Mandatory Records:

- Register of Members
- Register of Directors
- Shareholding Register
- Board Meeting Minutes
- AGM Minutes
- Statutory Registers

Annual Filing Support:

- AOC-4 (Financial statements)
- MGT-7 (Annual return)

---

# 🧾 4️⃣ ECOMMERCE-SPECIFIC COMPLIANCE

## Direct Website Sales

Invoices must:

- Display GSTIN
- Show place of supply
- Show GST breakup (CGST / SGST / IGST)
- Mention HSN code
- Store invoice permanently (PDF)

---

## Payment & Transaction Records (Razorpay)

The system must store:

- Razorpay Payment ID
- Internal Order ID
- Amount
- GST component
- Refund records
- Chargebacks (if any)
- Settlement amount
- Settlement date
- Gateway fees

Daily reconciliation required:

Razorpay Settlement Report  
vs  
Internal Ledger  

Mismatch must trigger alert.

---

# 📦 5️⃣ INVENTORY RECORDS (CRITICAL FOR FURNITURE BUSINESS)

The BMS must maintain:

- Raw materials register
- Work-in-progress (WIP) register
- Finished goods register
- Scrap / wastage register
- Returns register

System must support:

- Stock movement report
- Closing stock report
- Valuation method (FIFO / Weighted Average)

GST officer can request reconciliation anytime.

---

# 📊 6️⃣ MANDATORY REPORTS BMS MUST GENERATE

## Financial Reports
- Profit & Loss
- Balance Sheet
- Cash Flow Statement
- Ledger Report
- Sales Register (Monthly)
- Purchase Register

## GST Reports
- HSN-wise summary
- Tax liability summary
- ITC summary
- Outward supply summary (B2B & B2C)
- Credit/Debit note summary

## Inventory Reports
- Stock valuation report
- Stock movement report
- Negative stock alert report
- Slow moving stock report

---

# ⏳ 7️⃣ RECORD RETENTION

Minimum statutory retention:

- GST records → 6 years
- Income tax records → 8 years
- Company records → 8 years

Digital storage is valid but must be retrievable instantly.

---

# 🚨 8️⃣ SERIOUS COMPLIANCE RISKS

Common audit penalty triggers:

- Invoice mismatch with GSTR-1
- ITC claimed without valid invoice
- Stock mismatch during audit
- Ledger mismatch with bank statement
- Manual invoice edits after filing
- Refund without GST adjustment
- Duplicate payment recording
- Missing audit trail

System must prevent these conditions by design.

---

# 🧠 9️⃣ WHAT BMS MUST SUPPORT (NON-NEGOTIABLE)

To remain compliant, BMS must:

- Lock invoices after GST filing
- Track GST by HSN
- Auto-calculate CGST/SGST/IGST
- Maintain stock register
- Maintain immutable audit trail
- Store digital copies of invoices
- Export GST-ready reports
- Prevent editing of paid invoices
- Prevent marking paid without gateway verification
- Support credit note automation
- Support ledger reconciliation automation

---

# 📊 10️⃣ COMPLIANCE DASHBOARD STRUCTURE

The BMS must include a dedicated:

## “Compliance & Tax” Module

---

## GST Overview Section

Display:

- Total taxable sales (monthly)
- Total GST collected
- Total ITC claimed
- Net tax payable
- Filing status (Filed / Pending)

---

## Invoice Summary

- B2B invoice count
- B2C invoice count
- Credit notes issued
- Cancelled invoices
- Locked invoices

---

## Reconciliation Status

- Razorpay vs Ledger match %
- Bank vs Ledger match %
- Invoice vs GSTR match %

Status Indicators:
- Green = Reconciled
- Red = Mismatch

---

## Stock Compliance Section

- Opening vs closing variance
- Negative stock alert
- Unreconciled items
- Valuation consistency

---

# 🔎 11️⃣ AUDIT RISK GAP ANALYSIS FRAMEWORK

## Risk 1 — Invoice Manipulation
Can invoice be edited after payment?
If yes → HIGH RISK  
Solution: Lock financial fields after payment.

---

## Risk 2 — Stock Mismatch
Can stock go negative?
If yes → HIGH RISK  
Solution: Transaction locking & concurrency control.

---

## Risk 3 — Payment Fraud
Can order be marked PAID without webhook?
If yes → CRITICAL RISK  
Solution: Webhook-only payment authority.

---

## Risk 4 — GST Export Gap
Can BMS generate GSTR-ready export?
If no → HIGH RISK  
Solution: Monthly automated GST export.

---

## Risk 5 — Ledger Drift
Does sum of paid orders equal ledger income?
If not enforced → HIGH RISK  
Solution: Daily reconciliation job.

---

## Risk 6 — Audit Log Integrity
Can audit logs be deleted or modified?
If yes → CRITICAL RISK  
Solution: Immutable audit log table.

---

# 🛠 12️⃣ IMMEDIATE IMPLEMENTATION REQUIREMENTS

To achieve audit readiness:

- Immutable audit log table
- GST filing lock mechanism
- Daily reconciliation cron job
- Compliance dashboard module
- HSN mandatory enforcement
- Settlement matching automation
- Credit note automation
- Inventory valuation method configuration

---

# FINAL STANDARD

If a GST officer or auditor requests:

- Stock register
- GST reconciliation for last 6 months
- Payment settlement proof
- Ledger summary
- Audit logs

The BMS must produce these within 2 minutes.

If manual compilation or Excel work is required, the system is non-compliant.

The system must be:

- Financially trustworthy
- Audit-safe
- Reconciliation-ready
- Ledger-consistent
- Inventory-accurate
- GST-aligned
- Legally defensible

If any compliance guardrail is violated, the feature must not ship.