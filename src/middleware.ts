// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

const publicRoutes = ['/', '/login', '/signup']
const authRoutes = ['/login', '/signup']

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl
  const token = await getToken({ req: request })
  
  // Construct callback URL with both path and query parameters
  const callbackUrl = encodeURIComponent(`${pathname}${search}`)

  // Handle public routes
  if (publicRoutes.includes(pathname)) {
    // Redirect authenticated users away from auth routes
    if (token && authRoutes.includes(pathname)) {
      return NextResponse.redirect(new URL('/', request.url))
    }
    return NextResponse.next()
  }

  // Handle unauthenticated users
  if (!token) {
    return NextResponse.redirect(
      new URL(`/login?callbackUrl=${callbackUrl}`, request.url)
    )
  }

  // Prevent authenticated users from accessing auth routes
  if (authRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|logo.png).*)',
  ],
}