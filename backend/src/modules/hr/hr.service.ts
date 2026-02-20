import prisma from '../../config/db';
import { paginate, paginatedResponse, parseSort } from '../../utils/pagination';
import { createError } from '../../middleware/errorHandler';
import { CreateEmployeeInput, MarkAttendanceInput } from './hr.schema';
import { AttendanceStatus } from '@prisma/client';

const SORTABLE = ['name', 'department', 'salary', 'joinDate', 'createdAt'];

// ─── Employees ──────────────────────────────────────────
export const listEmployees = async (query: Record<string, string>) => {
    const { skip, take, page, limit } = paginate(query);
    const orderBy = parseSort(query.sortBy, query.order, SORTABLE);

    const where: Record<string, unknown> = {};
    if (query.department) where.department = query.department;
    if (query.status) where.status = query.status;
    if (query.search) {
        where.OR = [
            { name: { contains: query.search, mode: 'insensitive' } },
            { email: { contains: query.search, mode: 'insensitive' } },
            { role: { contains: query.search, mode: 'insensitive' } },
        ];
    }

    const [data, total] = await Promise.all([
        prisma.employee.findMany({ where, skip, take, orderBy }),
        prisma.employee.count({ where }),
    ]);
    return paginatedResponse(data, total, page, limit);
};

export const getEmployeeById = async (id: string) => {
    const emp = await prisma.employee.findUnique({
        where: { id },
        include: {
            user: { select: { id: true, email: true, role: true } },
            attendanceRecords: { take: 30, orderBy: { date: 'desc' } },
        },
    });
    if (!emp) throw createError(404, 'Employee not found');
    return emp;
};

export const createEmployee = async (data: CreateEmployeeInput) => {
    return prisma.employee.create({
        data: {
            ...data,
            joinDate: data.joinDate ? new Date(data.joinDate) : undefined,
            dob: data.dob ? new Date(data.dob) : undefined,
        },
    });
};

export const updateEmployee = async (id: string, data: Partial<CreateEmployeeInput>) => {
    await getEmployeeById(id);
    return prisma.employee.update({
        where: { id },
        data: {
            ...data,
            joinDate: data.joinDate ? new Date(data.joinDate) : undefined,
            dob: data.dob ? new Date(data.dob) : undefined,
        },
    });
};

export const softDeleteEmployee = async (id: string) => {
    await getEmployeeById(id);
    return prisma.employee.update({ where: { id }, data: { status: 'TERMINATED' } });
};

// ─── Attendance ─────────────────────────────────────────
export const markAttendance = async (input: MarkAttendanceInput) => {
    const date = new Date(input.date);
    const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const endOfDay = new Date(startOfDay.getTime() + 86400000);

    // Upsert: if exists for that employee+date, update
    const existing = await prisma.attendance.findFirst({
        where: { employeeId: input.employeeId, date: { gte: startOfDay, lt: endOfDay } },
    });

    if (existing) {
        return prisma.attendance.update({
            where: { id: existing.id },
            data: {
                checkIn: input.checkIn ? new Date(`${input.date}T${input.checkIn}`) : undefined,
                checkOut: input.checkOut ? new Date(`${input.date}T${input.checkOut}`) : undefined,
                status: input.status as AttendanceStatus || undefined,
            },
        });
    }

    return prisma.attendance.create({
        data: {
            employeeId: input.employeeId,
            date: startOfDay,
            checkIn: input.checkIn ? new Date(`${input.date}T${input.checkIn}`) : undefined,
            checkOut: input.checkOut ? new Date(`${input.date}T${input.checkOut}`) : undefined,
            status: (input.status as AttendanceStatus) || 'PRESENT',
        },
    });
};

export const listAttendance = async (query: Record<string, string>) => {
    const { skip, take, page, limit } = paginate(query);

    const where: Record<string, unknown> = {};
    if (query.employeeId) where.employeeId = query.employeeId;
    if (query.status) where.status = query.status as AttendanceStatus;
    if (query.month) {
        const [year, month] = query.month.split('-').map(Number);
        where.date = {
            gte: new Date(year, month - 1, 1),
            lt: new Date(year, month, 1),
        };
    }

    const [data, total] = await Promise.all([
        prisma.attendance.findMany({
            where, skip, take, orderBy: { date: 'desc' },
            include: { employee: { select: { id: true, name: true, department: true } } },
        }),
        prisma.attendance.count({ where }),
    ]);
    return paginatedResponse(data, total, page, limit);
};

export const getSummary = async () => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [departments, attendanceThisMonth, employees] = await Promise.all([
        prisma.employee.groupBy({
            by: ['department'],
            where: { status: 'ACTIVE' },
            _count: { id: true },
        }),
        prisma.attendance.count({
            where: { date: { gte: startOfMonth }, status: 'PRESENT' },
        }),
        prisma.employee.aggregate({
            where: { status: 'ACTIVE' },
            _count: { id: true },
            _sum: { salary: true },
        }),
    ]);

    const workingDays = now.getDate(); // approximate
    const totalAttendancePossible = (employees._count.id || 0) * workingDays;

    return {
        headcountByDepartment: departments.map(d => ({ department: d.department || 'Unassigned', count: d._count.id })),
        attendanceRateThisMonth: totalAttendancePossible > 0
            ? Math.round((attendanceThisMonth / totalAttendancePossible) * 100)
            : 0,
        monthlySalaryExpense: employees._sum.salary || 0,
        totalEmployees: employees._count.id || 0,
    };
};
