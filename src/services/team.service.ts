import bcrypt from 'bcrypt';
import type { Role } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import type { TeamInviteInput, TeamUpdateInput } from '@/lib/validation/team';

const ADMIN_ROLES: Role[] = [
    'TAILOR',
    'PRODUCT_MANAGER',
    'CUSTOMER_SUPPORT',
    'SUPER_ADMIN',
];

async function activeSuperAdminCount(): Promise<number> {
    return prisma.user.count({
        where: { role: 'SUPER_ADMIN', deletedAt: null },
    });
}

export const teamService = {
    /**
     * List all admin staff (any non-CUSTOMER role).
     */
    async listAll() {
        return prisma.user.findMany({
            where: { role: { in: ADMIN_ROLES } },
            orderBy: [{ deletedAt: 'asc' }, { createdAt: 'desc' }],
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                phone: true,
                createdAt: true,
                deletedAt: true,
                _count: { select: { tailoringJobs: true } },
            },
        });
    },

    /**
     * Create an admin user. Caller must be SUPER_ADMIN.
     * The password is set immediately — the new user can sign in with it.
     */
    async invite(input: TeamInviteInput) {
        const existing = await prisma.user.findUnique({
            where: { email: input.email },
            select: { id: true, deletedAt: true },
        });
        if (existing && !existing.deletedAt) {
            throw new Error('A user with this email already exists');
        }

        const hashed = await bcrypt.hash(input.password, 10);

        // If a soft-deleted user exists, reactivate + reuse the row.
        if (existing?.deletedAt) {
            return prisma.user.update({
                where: { id: existing.id },
                data: {
                    name: input.name,
                    password: hashed,
                    role: input.role,
                    phone: input.phone?.trim() || null,
                    deletedAt: null,
                },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    phone: true,
                    createdAt: true,
                },
            });
        }

        return prisma.user.create({
            data: {
                email: input.email,
                name: input.name,
                role: input.role,
                password: hashed,
                phone: input.phone?.trim() || null,
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                phone: true,
                createdAt: true,
            },
        });
    },

    async update(id: string, input: TeamUpdateInput, actorId: string) {
        const target = await prisma.user.findUnique({
            where: { id },
            select: { id: true, role: true, deletedAt: true },
        });
        if (!target) throw new Error('Member not found');

        // Safety: don't let the last SUPER_ADMIN demote themselves.
        if (
            input.role &&
            target.role === 'SUPER_ADMIN' &&
            input.role !== 'SUPER_ADMIN'
        ) {
            const count = await activeSuperAdminCount();
            if (count <= 1) {
                throw new Error(
                    'Cannot demote the last active super admin — promote another member first'
                );
            }
        }

        // Prevent role downgrades on yourself via this endpoint to avoid lockouts.
        if (id === actorId && input.role && input.role !== target.role) {
            throw new Error('You cannot change your own role');
        }

        return prisma.user.update({
            where: { id },
            data: {
                ...(input.role !== undefined ? { role: input.role } : {}),
                ...(input.reactivate ? { deletedAt: null } : {}),
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                phone: true,
                deletedAt: true,
            },
        });
    },

    async deactivate(id: string, actorId: string) {
        if (id === actorId) {
            throw new Error('You cannot deactivate your own account');
        }
        const target = await prisma.user.findUnique({
            where: { id },
            select: { id: true, role: true, deletedAt: true },
        });
        if (!target) throw new Error('Member not found');
        if (target.deletedAt) return target;

        if (target.role === 'SUPER_ADMIN') {
            const count = await activeSuperAdminCount();
            if (count <= 1) {
                throw new Error(
                    'Cannot deactivate the last active super admin'
                );
            }
        }

        await prisma.user.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
    },
};
