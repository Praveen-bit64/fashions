import type { NextAuthOptions } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import bcrypt from 'bcrypt';
import { prisma } from './prisma';
import type { Role } from '@prisma/client';

const ADMIN_ROLES: Role[] = [
    'SUPER_ADMIN',
    'PRODUCT_MANAGER',
    'CUSTOMER_SUPPORT',
    'TAILOR',
];

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma),
    session: {
        strategy: 'jwt', // jwt strategy is required when using Credentials provider
        maxAge: 7 * 24 * 60 * 60,
    },
    secret: process.env.NEXTAUTH_SECRET,
    pages: {
        // No dedicated /sign-in page — the storefront uses a modal on `/` that
        // opens automatically when `?signin=1` or `?callbackUrl=…` is present.
        signIn: '/',
    },
    providers: [
        Credentials({
            name: 'credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(creds) {
                if (!creds?.email || !creds?.password) return null;

                const user = await prisma.user.findFirst({
                    where: {
                        email: creds.email.toLowerCase(),
                        deletedAt: null,
                    },
                });

                if (!user?.password) return null;

                const ok = await bcrypt.compare(creds.password, user.password);
                if (!ok) return null;

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    image: user.image ?? undefined,
                };
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            // First sign-in: user object is present
            if (user) {
                token.id = user.id;
                token.role = (user as { role: Role }).role;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;
                session.user.role = token.role as Role;
            }
            return session;
        },
    },
};

export function isAdmin(role: Role | undefined): boolean {
    return Boolean(role && ADMIN_ROLES.includes(role));
}

export { ADMIN_ROLES };
