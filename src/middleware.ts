import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"
import { UserRole } from "@prisma/client"
import { securityMiddleware } from "./middleware.security"

export default withAuth(
  function middleware(req) {
    // Apply security middleware first
    const securityResponse = securityMiddleware(req)
    if (securityResponse.status !== 200) {
      return securityResponse
    }

    const token = req.nextauth.token
    const isAuth = !!token
    const isAuthPage = req.nextUrl.pathname.startsWith('/auth')
    const isApiAuthRoute = req.nextUrl.pathname.startsWith('/api/auth')
    const isPublicRoute = publicRoutes.includes(req.nextUrl.pathname)

    // Allow API auth routes
    if (isApiAuthRoute) {
      return NextResponse.next()
    }

    // Allow public routes
    if (isPublicRoute) {
      return NextResponse.next()
    }

    // Redirect to signin if not authenticated and trying to access protected route
    if (!isAuth && !isAuthPage && !isPublicRoute) {
      const signInUrl = new URL('/auth/signin', req.url)
      signInUrl.searchParams.set('callbackUrl', req.nextUrl.pathname)
      return NextResponse.redirect(signInUrl)
    }

    // Redirect authenticated users away from auth pages
    if (isAuth && isAuthPage) {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    // Role-based access control
    if (isAuth && token) {
      const userRole = token.role as UserRole
      const pathname = req.nextUrl.pathname

      // Admin-only routes
      if (pathname.startsWith('/admin') && userRole !== 'ADMIN') {
        return NextResponse.redirect(new URL('/unauthorized', req.url))
      }

      // Parent-specific routes
      if (pathname.startsWith('/parent') && !['PARENT', 'ADMIN'].includes(userRole)) {
        return NextResponse.redirect(new URL('/unauthorized', req.url))
      }

      // Child-specific routes (children can only access their own content)
      if (pathname.startsWith('/child') && !['CHILD', 'PARENT', 'ADMIN'].includes(userRole)) {
        return NextResponse.redirect(new URL('/unauthorized', req.url))
      }

      // Partner-specific routes
      if (pathname.startsWith('/partner') && !['PARTNER', 'ADMIN'].includes(userRole)) {
        return NextResponse.redirect(new URL('/unauthorized', req.url))
      }

      // Supporter-specific routes
      if (pathname.startsWith('/supporter') && !['SUPPORTER', 'ADMIN'].includes(userRole)) {
        return NextResponse.redirect(new URL('/unauthorized', req.url))
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: () => {
        // This determines if the middleware should run
        return true // We handle authorization logic in the middleware function above
      },
    },
  }
)

// Routes that don't require authentication
const publicRoutes = [
  '/',
  '/about',
  '/contact',
  '/privacy',
  '/terms',
  '/pricing',
  '/features',
]

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.svg$).*)',
  ],
}