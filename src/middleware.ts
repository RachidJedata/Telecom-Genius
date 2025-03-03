import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request:NextRequest) {
  const path = request.nextUrl.pathname;

  // Define the routes that should be restricted for authenticated users
  const restrictedRoutes = ['/login', '/signup'];

  // Get the user's session token
  const token = await getToken({ req: request });

  // If the user is authenticated and tries to access a restricted route, redirect to home
  if (token && restrictedRoutes.includes(path)) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Otherwise, allow the request to proceed
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - `/_next/static` (static files)
     * - `/_next/image` (image optimization files)
     * - `/favicon.ico` (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};

console.log('middleware is running');