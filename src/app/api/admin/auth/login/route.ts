import { NextResponse } from 'next/server';
import {
  ADMIN_COOKIE_NAME,
  SESSION_MAX_AGE,
  checkAdminPassword,
  createAdminSessionToken,
  isRateLimited,
  recordFailedLogin,
  recordSuccessfulLogin,
} from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      request.headers.get('x-real-ip') ||
      'admin-client';

    if (isRateLimited(ip)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Too many incorrect attempts. Account locked for 15 minutes for security.',
        },
        { status: 429 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const password = body?.password || '';

    if (!password) {
      return NextResponse.json(
        { success: false, error: 'Password is required' },
        { status: 400 }
      );
    }

    const isValid = checkAdminPassword(password);

    if (!isValid) {
      const remaining = recordFailedLogin(ip);
      const msg =
        remaining > 0
          ? `Invalid administrator password. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`
          : 'Too many incorrect attempts. Account locked for 15 minutes.';
      return NextResponse.json({ success: false, error: msg }, { status: 401 });
    }

    recordSuccessfulLogin(ip);
    const token = await createAdminSessionToken();

    const response = NextResponse.json({
      success: true,
      message: 'Authentication successful',
    });

    response.cookies.set({
      name: ADMIN_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: SESSION_MAX_AGE,
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Authentication error' },
      { status: 500 }
    );
  }
}
