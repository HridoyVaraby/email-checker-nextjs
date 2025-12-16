import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
    pages: {
        signIn: '/login',
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const protectedRoutes = ['/upload', '/history', '/dashboard'];
            const isProtectedRoute = protectedRoutes.some(route => nextUrl.pathname.startsWith(route));

            if (isProtectedRoute) {
                if (isLoggedIn) return true;
                return false; // Redirect to login
            } else if (isLoggedIn) {
                // Redirect to upload if trying to access login/register while logged in
                if (nextUrl.pathname === '/login' || nextUrl.pathname === '/register') {
                    return Response.redirect(new URL('/upload', nextUrl));
                }
            }
            return true;
        },
    },
    providers: [], // Providers added in auth.ts
} satisfies NextAuthConfig;
