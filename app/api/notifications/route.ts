import { NextResponse } from 'next/server';
import { NotificationType, MatchNotification, NotificationHistory } from '../../../types/notifications';
import { userPreferences } from '../../../config/userPreferences';
import { NotificationStore } from '../../../lib/notificationStore';
import { v4 as uuidv4 } from 'uuid';

const PUSHOVER_API_URL = 'https://api.pushover.net/1/messages.json';
const PUSHOVER_APP_TOKEN = process.env.PUSHOVER_APP_TOKEN;

export async function POST(request: Request) {
  try {
    const notification: MatchNotification = await request.json();
    
    // Server-side validation
    if (!notification.matchId || !notification.message) {
      return NextResponse.json({ error: 'Invalid notification data' }, { status: 400 });
    }

    const historyEntry: Omit<NotificationHistory, 'deliveredAt' | 'error'> = {
      id: uuidv4(),
      notification,
      status: 'pending',
      createdAt: new Date(),
    };

    try {
      // Send to Pushover
      const response = await fetch(PUSHOVER_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: PUSHOVER_APP_TOKEN,
          user: process.env.PUSHOVER_USER_KEY,
          message: notification.message,
          title: `Tennis Match Update: ${notification.type}`,
          priority: notification.priority,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send notification');
      }

      // Update history with success
      const successEntry: NotificationHistory = {
        ...historyEntry,
        status: 'sent',
        deliveredAt: new Date()
      };
      await NotificationStore.addNotification(successEntry);
    } catch (error) {
      // Update history with failure
      const failureEntry: NotificationHistory = {
        ...historyEntry,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      await NotificationStore.addNotification(failureEntry);
      throw error;
    }

    return NextResponse.json({ success: true, notificationId: historyEntry.id });
  } catch (error) {
    console.error('Notification error:', error);
    return NextResponse.json({ error: 'Failed to send notification' }, { status: 500 });
  }
}

export async function GET() {
  const notifications = await NotificationStore.getNotifications();
  return NextResponse.json({
    preferences: userPreferences,
    history: notifications
  });
} 