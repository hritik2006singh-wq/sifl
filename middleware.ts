import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const role = request.cookies.get('user_role')?.value;
    const { pathname } = request.nextUrl;

    // If there's no role cookie and they are trying to access protected routes, redirect to login
    if (!role) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // Admin routes
    if (pathname.startsWith('/admin')) {
        if (role !== 'admin') {
            // Redirect based on actual role
            if (role === 'teacher') return NextResponse.redirect(new URL('/teacher/dashboard', request.url));
            if (role === 'student') return NextResponse.redirect(new URL('/student/dashboard', request.url));
            return NextResponse.redirect(new URL('/login', request.url));
        }
    }

    // Teacher routes
    if (pathname.startsWith('/teacher')) {
        if (pathname === '/teacher') return NextResponse.redirect(new URL('/teacher/dashboard', request.url));

        if (role === 'admin') return NextResponse.next(); // Admins can see teacher pages if needed or maybe redirect
        if (role !== 'teacher') {
            if (role === 'student') return NextResponse.redirect(new URL('/student/dashboard', request.url));
            return NextResponse.redirect(new URL('/admin', request.url));
        }
    }

    // Student routes
    if (pathname.startsWith('/student')) {
        if (pathname === '/student') return NextResponse.redirect(new URL('/student/dashboard', request.url));

        if (role === 'admin' || role === 'teacher') return NextResponse.next(); // Staff might view student dash
        if (role !== 'student') {
            if (role === 'admin') return NextResponse.redirect(new URL('/admin', request.url));
            if (role === 'teacher') return NextResponse.redirect(new URL('/teacher/dashboard', request.url));
            return NextResponse.redirect(new URL('/login', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*', '/teacher/:path*', '/student/:path*'],
};
