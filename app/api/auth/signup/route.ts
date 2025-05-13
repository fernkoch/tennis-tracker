import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { UserStore } from '../../../lib/userStore';
import nodemailer from 'nodemailer';
import bcrypt from 'bcryptjs';

// Configure email transport (you'll need to add these to .env.local)
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export async function POST(request: Request) {
  try {
    const { email, username, password, notificationType, pushoverKey } = await request.json();

    // Basic validation
    if (!email || !username) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await UserStore.getUserByEmail(email);
    if (existingUser) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 400 });
    }

    // Create user with unique ID
    const userId = uuidv4();
    const userPrefs = await UserStore.createDefaultPreferences(userId, username);

    // Update notification preferences based on type
    if (notificationType === 'pushover' && pushoverKey) {
      userPrefs.pushoverKey = pushoverKey;
    }

    // Save updated preferences
    await UserStore.saveUserPreferences({
      ...userPrefs,
      email, // Add email to preferences
    });

    // Set password if provided
    if (password) {
      await UserStore.setPassword(userId, password);
    }

    // Send welcome email
    if (process.env.EMAIL_USER) {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Welcome to Tennis Tracker Beta!',
        text: `Welcome to Tennis Tracker Beta, ${username}!
        
Your account has been created successfully. You can now start tracking your favorite tennis players and receive match notifications.

${password 
  ? 'You can sign in using your email and password.'
  : 'You can sign in using secure email links that we\'ll send you.'}

${notificationType === 'email' 
  ? 'You will receive match updates via email.'
  : 'You will receive instant notifications via Pushover.'}

Get started by adding your favorite players to your watchlist!

Best regards,
The Tennis Tracker Team`,
      });
    }

    return NextResponse.json({
      success: true,
      userId,
      message: 'Account created successfully'
    });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ 
      error: 'Failed to create account' 
    }, { status: 500 });
  }
} 