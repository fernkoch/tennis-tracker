import { NextResponse } from 'next/server';
import { ApiTennisService } from '../../lib/apiTennis';
import nodemailer from 'nodemailer';
import { UserStore } from '../../lib/userStore';
import { NotificationType } from '../../types/notifications';

export async function GET(request: Request) {
  const results = {
    api: { status: 'untested', error: null },
    email: { status: 'untested', error: null },
    database: { status: 'untested', error: null },
    notifications: { status: 'untested', error: null }
  };

  // Test API Tennis integration
  try {
    const matches = await ApiTennisService.getDailySchedule();
    results.api.status = matches.length > 0 ? 'success' : 'warning';
    if (matches.length === 0) {
      results.api.error = 'No matches found for today';
    }
  } catch (error) {
    results.api.status = 'error';
    results.api.error = error instanceof Error ? error.message : 'Unknown error';
  }

  // Test email configuration
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  try {
    await transporter.verify();
    results.email.status = 'success';
  } catch (error) {
    results.email.status = 'error';
    results.email.error = error instanceof Error ? error.message : 'Unknown error';
  }

  // Test database/file system
  try {
    const testUser = {
      userId: 'test-user',
      username: 'test',
      email: 'test@example.com',
      hasPassword: false,
      notificationType: 'email' as 'email' | 'pushover',
      pushoverKey: '',
      matchStartReminders: true,
      dailySchedule: true,
      favoritePlayersOnly: true,
      reminderTime: 15,
      dailyScheduleTime: '08:00',
      favoritePlayerIds: [],
      notificationTypes: {
        match_start: { enabled: true, priority: 1 },
        match_end: { enabled: true, priority: 0 },
        set_start: { enabled: false, priority: 0 },
        set_end: { enabled: true, priority: 0 },
        tiebreak: { enabled: true, priority: 1 },
        break_point: { enabled: true, priority: 1 },
        match_point: { enabled: true, priority: 1 },
        score_update: { enabled: false, priority: 0 }
      },
      quietHours: {
        enabled: true,
        start: '23:00',
        end: '07:00'
      }
    };

    await UserStore.saveUserPreferences(testUser);
    const retrieved = await UserStore.getUserPreferences('test-user');
    if (retrieved) {
      results.database.status = 'success';
    } else {
      throw new Error('Failed to retrieve test user');
    }
  } catch (error) {
    results.database.status = 'error';
    results.database.error = error instanceof Error ? error.message : 'Unknown error';
  }

  // Test Pushover notifications if configured
  if (process.env.PUSHOVER_APP_TOKEN && process.env.PUSHOVER_USER_KEY) {
    try {
      const response = await fetch('https://api.pushover.net/1/messages.json', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: process.env.PUSHOVER_APP_TOKEN,
          user: process.env.PUSHOVER_USER_KEY,
          message: 'System test notification',
          title: 'Tennis Updates Test'
        })
      });

      if (response.ok) {
        results.notifications.status = 'success';
      } else {
        const data = await response.json();
        throw new Error(data.error || 'Pushover request failed');
      }
    } catch (error) {
      results.notifications.status = 'error';
      results.notifications.error = error instanceof Error ? error.message : 'Unknown error';
    }
  } else {
    results.notifications.status = 'warning';
    results.notifications.error = 'Pushover not configured';
  }

  return NextResponse.json(results);
} 