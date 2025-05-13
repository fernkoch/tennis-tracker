import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { UserStore } from '../../../lib/userStore';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 400 });
    }

    // Verify the token from the magic links map
    const magicLinks = new Map<string, { email: string, expires: Date }>();
    const magicLink = magicLinks.get(token);

    if (!magicLink || magicLink.expires < new Date()) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 });
    }

    // Get user and create session
    const user = await UserStore.getUserByEmail(magicLink.email);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Set session cookie
    const cookieStore = cookies();
    cookieStore.set('userId', user.userId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    // Clean up used token
    magicLinks.delete(token);

    // Redirect to dashboard
    return NextResponse.redirect(new URL('/dashboard', request.url));
  } catch (error) {
    console.error('Verification error:', error);
    return NextResponse.json({ error: 'Failed to verify token' }, { status: 500 });
  }
} 