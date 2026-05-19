import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

const ADMIN_ROLES = [
    'SUPER_ADMIN',
    'PRODUCT_MANAGER',
    'CUSTOMER_SUPPORT',
    'TAILOR',
] as const;

export default withAuth(
    function middleware(req) {
        const path = req.nextUrl.pathname;
        const role = req.nextauth.token?.role as string | undefined;

        if (path.startsWith('/admin')) {
            if (!role || !ADMIN_ROLES.includes(role as (typeof ADMIN_ROLES)[number])) {
                return NextResponse.redirect(new URL('/', req.url));
            }
        }

        return NextResponse.next();
    },
    {
        callbacks: {
            authorized: ({ token, req }) => {
                // Only require a token for protected paths
                const path = req.nextUrl.pathname;
                if (
                    path.startsWith('/admin') ||
                    path.startsWith('/profile') ||
                    path.startsWith('/orders') ||
                    path.startsWith('/checkout')
                ) {
                    return Boolean(token);
                }
                return true;
            },
        },
    }
);

export const config = {
    matcher: [
        '/admin/:path*',
        '/profile/:path*',
        '/orders/:path*',
        '/checkout/:path*',
    ],
};
