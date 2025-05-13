import { NextResponse } from 'next/server';
import { UserStore } from '../../../lib/userStore';
import nodemailer from 'nodemailer';
import { v4 as uuidv4 } from 'uuid';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// In a real app, use a database. For beta, we'll use memory
const magicLinks = new Map<string, { email: string, expires: Date }>();

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const user = await UserStore.getUserByEmail(email);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Generate magic link token
    const token = uuidv4();
    magicLinks.set(token, {
      email,
      expires: new Date(Date.now() + 15 * 60 * 1000) // 15 minutes
    });

    // Get the base URL from the request
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    const host = request.headers.get('host') || 'localhost:3000';
    const magicLink = `${protocol}://${host}/auth/verify?token=${token}`;

    // Send magic link email
    if (process.env.EMAIL_USER) {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Sign in to Tennis Tracker',
        text: `Click this link to sign in to Tennis Tracker:

${magicLink}

This link will expire in 15 minutes.

If you didn't request this, you can safely ignore this email.

Prefer not to use magic links? You can set up a password in your account settings.`,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Check your email for a sign-in link'
    });
  } catch (error) {
    console.error('Magic link error:', error);
    return NextResponse.json({ 
      error: 'Failed to send magic link' 
    }, { status: 500 });
  }
}

// Verify magic link token
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 400 });
  }

  const magicLink = magicLinks.get(token);
  if (!magicLink || magicLink.expires < new Date()) {
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 });
  }

  // Get user preferences
  const user = await UserStore.getUserByEmail(magicLink.email);
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  // Clean up used token
  magicLinks.delete(token);

  return NextResponse.json({
    success: true,
    userId: user.userId
  });
} 