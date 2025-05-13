import { NextResponse } from 'next/server';
import { NotificationStore } from '../../lib/notificationStore';
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
  // Debug environment variables
  const envDebug = {
    hasAppToken: !!process.env.PUSHOVER_APP_TOKEN,
    hasUserKey: !!process.env.PUSHOVER_USER_KEY,
    appTokenLength: process.env.PUSHOVER_APP_TOKEN?.length || 0,
    userKeyLength: process.env.PUSHOVER_USER_KEY?.length || 0
  };

  if (!process.env.PUSHOVER_APP_TOKEN || !process.env.PUSHOVER_USER_KEY) {
    return NextResponse.json({ 
      error: 'Pushover configuration missing',
      debug: envDebug
    }, { status: 500 });
  }

  const testNotification = {
    id: uuidv4(),
    notification: {
      type: 'match_start' as const,
      matchId: 'test-match',
      message: '🎾 Test Notification: Djokovic vs Nadal starting in 15 minutes on Center Court!',
      timestamp: new Date(),
      priority: 0
    },
    status: 'pending' as const,
    createdAt: new Date()
  };

  try {
    console.log('Sending test notification to Pushover...');
    const response = await fetch('https://api.pushover.net/1/messages.json', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token: process.env.PUSHOVER_APP_TOKEN,
        user: process.env.PUSHOVER_USER_KEY,
        message: testNotification.notification.message,
        title: 'Tennis Match Update: Test',
        priority: testNotification.notification.priority,
      }),
    });

    const responseData = await response.json();
    console.log('Pushover response:', responseData);

    if (!response.ok) {
      throw new Error(`Failed to send notification: ${JSON.stringify(responseData)}`);
    }

    const successEntry = {
      ...testNotification,
      status: 'sent' as const,
      deliveredAt: new Date()
    };
    await NotificationStore.addNotification(successEntry);

    return NextResponse.json({ 
      success: true, 
      message: 'Test notification sent successfully',
      notificationId: testNotification.id,
      pushoverResponse: responseData
    });
  } catch (error) {
    console.error('Test notification error:', error);
    
    const failureEntry = {
      ...testNotification,
      status: 'failed' as const,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
    await NotificationStore.addNotification(failureEntry);

    return NextResponse.json({ 
      error: 'Failed to send test notification',
      details: error instanceof Error ? error.message : 'Unknown error',
      debug: envDebug
    }, { status: 500 });
  }
} 