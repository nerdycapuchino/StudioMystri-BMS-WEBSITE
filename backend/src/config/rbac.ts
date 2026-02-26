/**
 * Defines module and action-level RBAC restrictions based on the explicit policy matrix.
 * Actions: R (Read), C (Create), U (Update), D (Delete), A (Approve)
 */

export type Role =
    | 'SUPER_ADMIN'
    | 'ADMIN'
    | 'DESIGNER'
    | 'ARCHITECT'
    | 'SALES'
    | 'FINANCE'
    | 'HR'
    | 'CUSTOMER';

export type Module =
    | 'AUTH_USERS'
    | 'CRM_LEADS'
    | 'PROJECTS'
    | 'INVENTORY'
    | 'FINANCE_INVOICING'
    | 'HR_EMPLOYEE'
    | 'ECOMMERCE_PRODUCTS'
    | 'ECOMMERCE_ORDERS'
    | 'ECOMMERCE_DISCOUNTS'
    | 'ECOMMERCE_REFERRALS'
    | 'TEAMHUB';

export type Action = 'R' | 'C' | 'U' | 'D' | 'A';

type PermissionsResponse = {
    [key in Module]?: Action[];
};

export const rbacPolicy: Record<Role, PermissionsResponse> = {
    SUPER_ADMIN: {
        AUTH_USERS: ['R', 'C', 'U', 'D'], // Plus assign roles, config
        CRM_LEADS: ['R', 'C', 'U', 'D'],
        PROJECTS: ['R', 'C', 'U', 'D'],
        INVENTORY: ['R', 'C', 'U', 'D'],
        FINANCE_INVOICING: ['R', 'C', 'U', 'D', 'A'],
        HR_EMPLOYEE: ['R', 'C', 'U', 'D'],
        ECOMMERCE_PRODUCTS: ['R', 'C', 'U', 'D'],
        ECOMMERCE_ORDERS: ['R', 'C', 'U', 'D'],
        ECOMMERCE_DISCOUNTS: ['R', 'C', 'U', 'D'],
        ECOMMERCE_REFERRALS: ['R', 'C', 'U', 'D'],
        TEAMHUB: ['R', 'C', 'U', 'D'],
    },
    ADMIN: {
        AUTH_USERS: ['R', 'C', 'U'], // No hard delete
        CRM_LEADS: ['R', 'C', 'U', 'D'], // Soft delete in controller
        PROJECTS: ['R', 'C', 'U', 'D'],
        INVENTORY: ['R', 'C', 'U', 'D'],
        FINANCE_INVOICING: ['R'],
        HR_EMPLOYEE: ['R'], // Basic info only
        ECOMMERCE_PRODUCTS: ['R', 'C', 'U', 'D'],
        ECOMMERCE_ORDERS: ['R', 'C', 'U', 'D'], // Soft Delete
        ECOMMERCE_DISCOUNTS: ['R', 'C', 'U', 'D'],
        ECOMMERCE_REFERRALS: ['R', 'C', 'U'],
        TEAMHUB: ['R', 'C', 'U', 'D'],
    },
    HR: {
        AUTH_USERS: ['R', 'U'], // Employees only, HR fields only
        CRM_LEADS: [],
        PROJECTS: [],
        INVENTORY: [],
        FINANCE_INVOICING: ['R', 'C', 'U'], // Payroll only
        HR_EMPLOYEE: ['R', 'C', 'U', 'D'], // Soft Delete
        ECOMMERCE_PRODUCTS: [],
        ECOMMERCE_ORDERS: [],
        ECOMMERCE_DISCOUNTS: [],
        ECOMMERCE_REFERRALS: [],
        TEAMHUB: ['R', 'C', 'U', 'D'], // Delete own
    },
    FINANCE: {
        AUTH_USERS: ['R'], // Basic profile
        CRM_LEADS: ['R'], // Read only for invoice linking
        PROJECTS: ['R'], // Budget view only
        INVENTORY: ['R'],
        FINANCE_INVOICING: ['R', 'C', 'U', 'D', 'A'], // Soft Delete, Approve
        HR_EMPLOYEE: ['R'], // Salary summary only
        ECOMMERCE_PRODUCTS: ['R'],
        ECOMMERCE_ORDERS: ['R', 'U'], // Update payment status only
        ECOMMERCE_DISCOUNTS: ['R'],
        ECOMMERCE_REFERRALS: ['R'], // Payout tracking
        TEAMHUB: ['R', 'C', 'U', 'D'], // Delete own
    },
    DESIGNER: {
        AUTH_USERS: [],
        CRM_LEADS: ['R'],
        PROJECTS: ['R', 'C', 'U'], // Design tasks/stages only
        INVENTORY: ['R'], // Material library only
        FINANCE_INVOICING: [],
        HR_EMPLOYEE: [],
        ECOMMERCE_PRODUCTS: ['R'], // Visible catalog only
        ECOMMERCE_ORDERS: [],
        ECOMMERCE_DISCOUNTS: [],
        ECOMMERCE_REFERRALS: [],
        TEAMHUB: ['R', 'C', 'U', 'D'], // Delete own
    },
    ARCHITECT: {
        AUTH_USERS: [],
        CRM_LEADS: ['R', 'C', 'U'],
        PROJECTS: ['R', 'C', 'U'],
        INVENTORY: ['R', 'C', 'U'],
        FINANCE_INVOICING: [],
        HR_EMPLOYEE: [],
        ECOMMERCE_PRODUCTS: ['R'],
        ECOMMERCE_ORDERS: [],
        ECOMMERCE_DISCOUNTS: [],
        ECOMMERCE_REFERRALS: [],
        TEAMHUB: ['R', 'C', 'U', 'D'], // Delete own
    },
    SALES: {
        AUTH_USERS: [],
        CRM_LEADS: ['R', 'C', 'U', 'D'], // Soft Delete
        PROJECTS: ['R'], // Won leads only
        INVENTORY: [],
        FINANCE_INVOICING: ['R'], // Invoice status only
        HR_EMPLOYEE: [],
        ECOMMERCE_PRODUCTS: ['R'],
        ECOMMERCE_ORDERS: ['R'], // CRM linked orders
        ECOMMERCE_DISCOUNTS: [],
        ECOMMERCE_REFERRALS: [],
        TEAMHUB: ['R', 'C', 'U', 'D'], // Delete own
    },
    CUSTOMER: {
        AUTH_USERS: ['R', 'C', 'U'], // Self only
        CRM_LEADS: ['R', 'U'], // Own profile only
        PROJECTS: ['R'], // Assigned project only
        INVENTORY: [],
        FINANCE_INVOICING: ['R'], // Own invoice only
        HR_EMPLOYEE: [],
        ECOMMERCE_PRODUCTS: ['R'], // Public only
        ECOMMERCE_ORDERS: ['R', 'C', 'U'], // Own orders, Cancel own before shipped
        ECOMMERCE_DISCOUNTS: [],
        ECOMMERCE_REFERRALS: ['R'], // Own referrals only
        TEAMHUB: ['R', 'C', 'U', 'D'], // Project channel only, Post/Edit/Delete own
    },
};

/**
 * Helper function to check if a specific role has a specific permission on a module.
 */
export const hasPermission = (role: Role, module: Module, action: Action): boolean => {
    const permissions = rbacPolicy[role]?.[module];
    return Array.isArray(permissions) && permissions.includes(action);
};
