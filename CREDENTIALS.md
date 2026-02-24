# Studio Mystri BMS - System Credentials

This document contains the default user credentials for the Studio Mystri BMS application as defined in the database seed configuration.

## 🔐 Default Accounts

| Role | User Name | Email Address | Password |
| :--- | :--- | :--- | :--- |
| **Owner (Super Admin)** | IT Management | `it-support@studiomystri.com` | `SuperAdmin@1234` |
| **Admin** | Vikram Malhotra | `admin@studiomystri.com` | `Admin@1234` |
| **Designer** | Ananya Singh | `designer@studiomystri.com` | `Designer@1234` |
| **Architect** | Arjun Desai | `architect@studiomystri.com` | `Architect@1234` |
| **Sales** | Kabir Khan | `sales@studiomystri.com` | `Sales@1234` |
| **Finance** | Priya Verma | `finance@studiomystri.com` | `Finance@1234` |
| **HR** | Neha Kapoor | `hr@studiomystri.com` | `HR@1234` |

*Note: The system contains 8 defined organizational roles. The legacy `MANAGER` role was deprecated for explicit structural roles.*

## 👥 System Roles

The following explicit roles govern access across the system:

- `SUPER_ADMIN`: Owner level. Full system access, all modules, company settings, and user provisioning.
- `ADMIN`: Full operational and back-office access. Restricted from system configuration settings.
- `DESIGNER`: Focused access to CRM, Projects, and internal collaboration.
- `ARCHITECT`: Core operational role. Full access to Projects, Inventory, and CRM.
- `SALES`: Frontline CRM. Lead management, pipeline handling, and project inquiries.
- `FINANCE`: Exclusive access to Invoicing, ledger tracking, payroll, and asset registration.
- `HR`: Exclusive access to Employee records, attendance, and leave management.

---

## 📧 Automated System Email

The system uses the following dedicated email for automated dispatch (e.g. Password Resets):

- **Address**: `bms@studiomystri.com`
- **Host**: `smtp.hostinger.com`

---
> [!IMPORTANT]
> Change these default passwords immediately after the initial deployment to production for security.
