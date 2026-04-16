import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // We mirrored the localStorage token into a cookie named 'echoes_token' inside AuthContext
  const token = request.cookies.get('echoes_token')?.value;
  const { pathname } = request.nextUrl;

  const protectedRoutes = ['/feed', '/write', '/matches', '/chat', '/profile', '/welcome'];
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));

  if (!token && isProtectedRoute) {
    const loginUrl = new URL('/auth', request.url);
    return NextResponse.redirect(loginUrl);
  }

  if (token && pathname === '/auth') {
    const feedUrl = new URL('/feed', request.url);
    return NextResponse.redirect(feedUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/auth', '/feed', '/write', '/matches', '/chat', '/profile', '/welcome'],
};
