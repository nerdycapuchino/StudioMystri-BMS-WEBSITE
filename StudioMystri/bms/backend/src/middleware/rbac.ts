import fs from "fs";
import path from "path";
import { Request, Response, NextFunction } from "express";
import { createError } from './errorHandler';

type Action = "read" | "create" | "update" | "delete" | "approve";

const policyPath = path.join(__dirname, "../../../rbac-policy.json");
const policy = JSON.parse(fs.readFileSync(policyPath, "utf-8"));

export const authorize = (module: string, action: Action) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const user = req.user; // must be attached from auth middleware

        if (!user || !user.role) {
            return next(createError(401, "Unauthorized: Please log in."));
        }

        const rolePolicy = policy[user.role];

        if (!rolePolicy) {
            return next(createError(403, "Role not defined in RBAC policy"));
        }

        const modulePermissions = rolePolicy.modules[module];

        if (!modulePermissions || !modulePermissions.includes(action)) {
            console.warn(`[RBAC BLOCK] User ${user.email} (${user.role}) attempted to ${action} on ${module}`);
            return next(createError(403, `Forbidden: ${user.role} cannot ${action} in ${module}`));
        }

        next();
    };
};

/**
 * Middleware that dynamically determines the Action based on the HTTP Method.
 */
export const enforceModuleRbac = (module: string) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const methodToAction: Record<string, Action> = {
            GET: 'read',
            POST: 'create',
            PUT: 'update',
            PATCH: 'update',
            DELETE: 'delete',
        };
        const action = methodToAction[req.method] || 'read';
        return authorize(module, action)(req, res, next);
    };
};
