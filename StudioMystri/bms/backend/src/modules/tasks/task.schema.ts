import { z } from 'zod';

export const createTaskSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().optional().nullable(),
    assignedToId: z.string().uuid().optional().nullable(),
    projectId: z.string().uuid().optional().nullable(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
    status: z.enum(['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE']).optional(),
    dueDate: z.string().optional().nullable(),
});
export const updateTaskSchema = createTaskSchema.partial();
export const updateTaskStatusSchema = z.object({ status: z.enum(['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE']) });
export type CreateTaskInput = z.infer<typeof createTaskSchema>;
