import { z } from 'zod';

export const createEmployeeSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email(),
    phone: z.string().optional().nullable(),
    role: z.string().optional().nullable(),
    department: z.string().optional().nullable(),
    salary: z.number().min(0).optional(),
    joinDate: z.string().optional().nullable(),
    dob: z.string().optional().nullable(),
    currentAddress: z.string().optional().nullable(),
    permanentAddress: z.string().optional().nullable(),
    bloodGroup: z.string().optional().nullable(),
    emergencyContact: z.string().optional().nullable(),
    idProof: z.string().optional().nullable(),
    qualifications: z.string().optional().nullable(),
    notes: z.string().optional().nullable(),
    leavePolicy: z.number().int().min(0).optional(),
    leavesRemaining: z.number().int().min(0).optional(),
    userId: z.string().uuid().optional().nullable(),
});

export const updateEmployeeSchema = createEmployeeSchema.partial();

export const markAttendanceSchema = z.object({
    employeeId: z.string().uuid(),
    date: z.string().min(1, 'Date is required'),
    checkIn: z.string().optional().nullable(),
    checkOut: z.string().optional().nullable(),
    status: z.enum(['PRESENT', 'ABSENT', 'LATE', 'HALF_DAY', 'LEAVE']).optional(),
});

export type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>;
export type MarkAttendanceInput = z.infer<typeof markAttendanceSchema>;
