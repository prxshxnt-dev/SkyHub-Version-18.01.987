import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Hardcoded authorized super admin email
export const SUPERADMIN_EMAIL = 'meinkxun@gmail.com';
export const AUTHORIZED_ADMIN_EMAILS = [
  SUPERADMIN_EMAIL,
  'skyhubowner@gmail.com'
];

/**
 * Authentication Middleware
 * Enforces strict access restriction to the Admin Panel (/dashboard) and Admin APIs (/api/admin/*).
 * Consistently recognizes 'meinkxun@gmail.com' as the authorized super_admin.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect /dashboard and all /api/admin/* endpoints
  const isDashboardRoute = pathname.startsWith('/dashboard');
  const isAdminApiRoute = pathname.startsWith('/api/admin');

  if (isDashboardRoute || isAdminApiRoute) {
    // 1. Check for authenticated email cookie
    const authEmailCookie = request.cookies.get('skyhub_auth_email')?.value?.toLowerCase()?.trim();
    const adminSessionCookie = request.cookies.get('skyhub_admin_session')?.value;
    const authHeader = request.headers.get('authorization');

    // Verify if identity matches hardcoded superadmin meinkxun@gmail.com or authorized list
    const isHardcodedSuperAdmin = authEmailCookie === SUPERADMIN_EMAIL;
    const isAuthorizedAdmin = isHardcodedSuperAdmin || (authEmailCookie && AUTHORIZED_ADMIN_EMAILS.includes(authEmailCookie));

    // Handle Admin API Protection
    if (isAdminApiRoute) {
      if (!isAuthorizedAdmin && !authHeader) {
        return NextResponse.json(
          {
            error: 'Access Denied',
            message: 'Administrative clearance required. Authorized access restricted to meinkxun@gmail.com.',
            status: 403
          },
          { status: 403 }
        );
      }
    }

    // Handle /dashboard Page Protection
    if (isDashboardRoute) {
      // Explicitly restrict access to the Admin Panel for all unauthorized users at the middleware level
      if (!isAuthorizedAdmin) {
        const redirectUrl = new URL('/', request.url);
        if (authEmailCookie) {
          redirectUrl.searchParams.set('auth', 'restricted');
          redirectUrl.searchParams.set('reason', 'unauthorized_account');
        } else {
          redirectUrl.searchParams.set('auth', 'login_required');
          redirectUrl.searchParams.set('target', pathname);
        }
        return NextResponse.redirect(redirectUrl);
      }
    }

    // Inject superadmin authorization headers forward to downstream handlers
    const response = NextResponse.next();
    if (isHardcodedSuperAdmin) {
      response.headers.set('x-user-role', 'super_admin');
      response.headers.set('x-user-email', SUPERADMIN_EMAIL);
    }
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/admin/:path*'
  ],
};
