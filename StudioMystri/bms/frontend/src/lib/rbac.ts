import policyData from '../../../rbac-policy.json';

// Type assertion since we know the structure of the JSON
export const policy: Record<string, { modules: Record<string, string[]> }> = policyData;

export type Role =
    | 'SUPER_ADMIN'
    | 'ADMIN'
    | 'DESIGNER'
    | 'ARCHITECT'
    | 'SALES'
    | 'FINANCE'
    | 'HR'
    | 'CUSTOMER';

export function can(role: string | null | undefined, module: string, action: string): boolean {
    if (!role) return false;
    return policy[role]?.modules?.[module]?.includes(action) || false;
}

