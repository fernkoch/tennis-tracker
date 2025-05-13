interface PushoverMessage {
  userKey: string;
  message: string;
  title?: string;
  priority?: number;
  sound?: string;
}

export async function sendPushoverNotification({
  userKey,
  message,
  title = 'Tennis Updates',
  priority = 0,
  sound = 'gamelan'
}: PushoverMessage): Promise<boolean> {
  const appToken = process.env.PUSHOVER_APP_TOKEN;
  
  if (!appToken) {
    console.error('Pushover app token not configured');
    return false;
  }

  try {
    const response = await fetch('https://api.pushover.net/1/messages.json', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        token: appToken,
        user: userKey,
        message,
        title,
        priority,
        sound
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.errors?.[0] || 'Failed to send notification');
    }

    return true;
  } catch (error) {
    console.error('Error sending Pushover notification:', error);
    return false;
  }
} 