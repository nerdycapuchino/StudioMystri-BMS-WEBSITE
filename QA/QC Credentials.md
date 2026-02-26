# STUDIO MYSTRI  
# BMS + ECOMMERCE PLATFORM  
# MASTER QA, QC & ENGINEERING GOVERNANCE DOCUMENT  

---

# 1. PURPOSE

This document defines the complete Quality Assurance (QA), Quality Control (QC), Architecture Guardrails, Security Standards, RBAC Enforcement, Payment Controls, and Automated Agentic Testing Strategy for the Studio Mystri BMS + eCommerce system.

The objective is to guarantee:

- Functional correctness  
- Financial integrity  
- Inventory accuracy  
- Role-based isolation  
- Audit-safe commerce  
- Concurrency safety  
- Security compliance  
- Production reliability  

No feature may bypass this governance.

---

# 2. CORE PRINCIPLES

## 2.1 Single Source of Truth

The BMS is the only authority for:

- Products  
- Orders  
- Inventory  
- Discounts  
- Referrals  
- Payments  
- Ledger entries  
- Users  

The storefront is presentation-only and stateless except for temporary cart state.

No duplicate databases.  
No parallel business logic.  

---

## 2.2 API-First Enforcement

All operations must flow:

Frontend → BMS API → Database

Never:

Frontend → Database  
Frontend → Payment success override  

All write operations must pass:

- Validation  
- RBAC middleware  
- Audit logging  
- Transaction integrity  

---

## 2.3 Environment Separation

Mandatory environments:

- Development  
- Staging  
- Production  

Production credentials must never be used locally.  
No testing in production.

---

# 3. GLOBAL QUALITY STANDARDS

Before any feature is marked complete:

- Unit tests written  
- API schema validated  
- RBAC verified  
- Audit logs verified  
- Database constraints validated  
- Edge cases tested  
- Error handling tested  
- Security tested  
- Manual QA checklist passed  
- Staging deployment validated  
- Automated browser test passed  

No exceptions.

---

# 4. ROLE-BASED ACCESS CONTROL (RBAC) ENFORCEMENT

## 4.1 Backend Mandatory Enforcement

RBAC must be enforced at:

- Express middleware  
- Database query layer  
- Socket layer (TeamHub)  

Frontend hiding is not security.

---

## 4.2 Role Escalation Protection

- Only SUPER_ADMIN can assign roles.  
- ADMIN cannot create SUPER_ADMIN.  
- CUSTOMER cannot access internal APIs.  
- Privilege escalation must be tested manually before release.

---

# 5. DATABASE GUARDRAILS

## 5.1 No Hard Deletes

All modules must use:

- isDeleted flag  
- deletedAt timestamp  
- deletedBy field  

Hard deletes allowed only for:

- SUPER_ADMIN  
- Non-financial temporary data  

---

## 5.2 Audit Log Mandatory

Every sensitive action must log:

- userId  
- role  
- action  
- entity  
- oldValue  
- newValue  
- timestamp  

Mandatory for:

- Inventory changes  
- Order status changes  
- Invoice updates  
- Payment status changes  
- Discount creation  
- Referral rewards  

No audit log = feature rejected.

---

## 5.3 Referential Integrity

Foreign keys must be enforced.

No:

- Orphaned orders  
- Orphaned order items  
- Orphaned payments  
- Orphaned referrals  

Database must reject invalid references.

---

# 6. PAYMENT GUARDRAILS

## 6.1 Payment Authority

Only verified Razorpay webhook can set:

paymentStatus = PAID  

Frontend cannot.  
Admin cannot manually override without:

- Payment reference  
- Audit log  
- SUPER_ADMIN approval  

---

## 6.2 Webhook Safety

Webhook must:

- Verify signature  
- Be idempotent  
- Reject duplicates  
- Log all events  

Duplicate webhooks must not create duplicate ledger entries.

---

## 6.3 Refund Protocol

Refund must:

1. Call gateway API  
2. Confirm refund ID  
3. Update order status  
4. Update ledger  
5. Log audit  

Manual refund without gateway confirmation is forbidden.

---

# 7. INVENTORY GUARDRAILS

## 7.1 Stock Lock Rule

At order creation:

- Reserve stock  
- If payment fails → release stock  
- If payment succeeds → finalize deduction  

Never deduct only after payment.

---

## 7.2 Negative Stock Prevention

System must block:

- stockQuantity < 0  
- Concurrent overselling  

Second conflicting transaction must fail safely.

---

# 8. FINANCIAL GUARDRAILS

## 8.1 Immutable Records

Once invoice marked PAID:

- Amount cannot change  
- Tax cannot change  
- Discount cannot change  

Corrections require credit note, not edit.

---

## 8.2 Ledger Integrity

Every financial event must:

- Create ledger entry  
- Reference Order ID  
- Reference PaymentTransaction ID  

Ledger total must equal sum of paid orders.

Mismatch triggers alert.

---

# 9. DISCOUNT & REFERRAL GUARDRAILS

## 9.1 Discount Engine Enforcement

Backend must enforce:

- Expiry  
- Usage limit  
- Per-user limit  
- Minimum order amount  
- Maximum discount cap  

Frontend calculations are not trusted.

---

## 9.2 Referral Fraud Prevention

System must block:

- Self-referral  
- Duplicate reward for same order  
- Reward on cancelled order  
- Multiple reward for same referred user  

Reward issued only when:

paymentStatus = PAID  
orderStatus != CANCELLED  

---

# 10. EMAIL AUTOMATION GUARDRAILS

Emails must trigger only on:

- Payment confirmation  
- Shipping ID addition  
- Referral reward  
- Email verification  

Every email must log:

- userId  
- orderId  
- emailType  
- status  
- timestamp  

No silent emails.

---

# 11. MODULE-WISE QA & QC

---

## 11.1 Authentication & RBAC

Test:

- Valid login  
- Invalid login  
- Expired token  
- Role-based restriction  
- JWT tampering  
- Rate limiting  

Expected: Proper 401/403 responses.

---

## 11.2 CRM

Test:

- Lead creation  
- Stage transitions  
- Duplicate email  
- Soft delete  
- Audit log presence  

---

## 11.3 Projects

Test:

- Budget updates  
- File uploads  
- Stage transitions  
- Financial visibility restrictions  

---

## 11.4 Inventory

Test:

- Concurrent stock deduction  
- Negative stock attempt  
- Low stock alert  
- Audit logging  

---

## 11.5 Finance

Test:

- Invoice creation  
- Partial payments  
- Razorpay verification  
- Duplicate webhook rejection  
- Ledger accuracy  

---

## 11.6 Ecommerce

Full flow:

1. Add to cart  
2. Apply discount  
3. Create order  
4. Process payment  
5. Webhook verification  
6. Confirmation email  
7. Shipping ID entry  
8. Shipping email  

Edge cases:

- Payment failure  
- Discount expiry  
- Duplicate submissions  
- Browser interruption  

---

## 11.7 Referral

Test:

- Referral link generation  
- Order conversion  
- Reward issue  
- Fraud prevention  

---

## 11.8 TeamHub

Test:

- Role-based channel access  
- Socket authentication  
- XSS injection attempt  
- Spam protection  
- Message persistence  

---

# 12. SYSTEM-WIDE QC TESTS

## 12.1 Concurrency Testing

Simulate:

- 10 simultaneous checkouts  
- 5 inventory updates  
- 3 invoice payments  

Verify no data corruption.

---

## 12.2 Performance Testing

Targets:

- Product load < 1 sec  
- Checkout < 2 sec  
- Webhook response < 500ms  

Load test:

- 500 concurrent users  
- 50 concurrent checkout flows  

---

## 12.3 Security Testing

Test:

- SQL injection  
- XSS  
- CSRF  
- JWT tampering  
- Privilege escalation  
- Direct API access  

---

## 12.4 Backup & Recovery

Simulate DB crash.  
Restore backup.  
Verify no order or payment loss.

---

# 13. AGENTIC BROWSER TESTING PROTOCOL

Automated browser agent must:

- Click every button  
- Submit every form  
- Leave required fields empty  
- Enter invalid formats  
- Spam submissions  
- Modify frontend values via console  
- Open parallel tabs  
- Inject scripts  
- Attempt restricted navigation  

System must:

- Reject invalid actions  
- Prevent data corruption  
- Maintain audit integrity  

No feature is production-ready unless it survives destructive exploration testing.

---

# 14. API CONTRACT VALIDATION

All APIs must be schema validated using:

- Zod or equivalent  
- OpenAPI response validation  

Unexpected response structure fails CI.

---

# 15. CHAOS TESTING

Simulate:

- DB failure mid-transaction  
- Delayed webhook  
- Duplicate webhook  
- Email server failure  
- Network latency  

System must fail gracefully and maintain consistency.

---

# 16. OBSERVABILITY REQUIREMENTS

Must log:

- Payment failures  
- Unauthorized attempts  
- Inventory conflicts  
- Referral attempts  
- Webhook events  

No silent system errors.

---

# 17. DATA DRIFT MONITORING

Daily automated checks:

- Ledger total = sum of paid orders  
- Payment gateway records = internal payments  
- Inventory totals consistent  
- Referral rewards match logs  

Mismatch triggers alert.

---

# 18. CI/CD ENFORCEMENT

Every merge must:

- Run unit tests  
- Run integration tests  
- Run RBAC matrix tests  
- Run headless browser tests  
- Validate API schema  
- Validate migrations  

Merge blocked if any fail.

---

# 19. RELEASE CRITERIA

Feature cannot go live unless:

- All tests pass  
- No role leakage  
- Payment verified  
- Inventory concurrency tested  
- Referral abuse tested  
- Audit logs validated  
- Backup snapshot created  

No exceptions.

---

# FINAL STANDARD

The system must be:

- Financially trustworthy  
- Audit-safe  
- Role-isolated  
- Concurrency-safe  
- Payment-secure  
- Inventory-accurate  
- Referral-abuse-resistant  

If a feature violates any guardrail, it does not ship.