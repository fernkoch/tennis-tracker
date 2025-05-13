import { TennisMatch } from '../types/match';

interface NotificationConfig {
  matchStartReminders: boolean;
  dailySchedule: boolean;
  favoritePlayersOnly: boolean;
  pushoverUserKey?: string;
}

const PUSHOVER_APP_TOKEN = process.env.NEXT_PUBLIC_PUSHOVER_APP_TOKEN;

export async function sendPushoverNotification(
  userKey: string,
  title: string,
  message: string,
  priority: number = 0
) {
  try {
    const response = await fetch('https://api.pushover.net/1/messages.json', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token: PUSHOVER_APP_TOKEN,
        user: userKey,
        title,
        message,
        priority,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to send notification');
    }

    return true;
  } catch (error) {
    console.error('Error sending Pushover notification:', error);
    return false;
  }
}

export async function sendMatchStartReminder(
  userKey: string,
  match: TennisMatch
) {
  const title = `Match Starting Soon: ${match.opponent}`;
  const message = `
${match.tournament}
Round: ${match.round}
Court: ${match.court || 'TBA'}
Time: ${match.time}
Surface: ${match.surface}
`.trim();

  return sendPushoverNotification(userKey, title, message);
}

export async function sendDailySchedule(
  userKey: string,
  matches: TennisMatch[],
  favoritePlayerIds?: string[]
) {
  const highlightedMatches = matches.filter(match => 
    favoritePlayerIds?.includes(match.id) || isHighProfileMatch(match)
  );
  
  const regularMatches = matches.filter(match => 
    !highlightedMatches.includes(match)
  );

  const title = 'Today\'s Tennis Schedule';
  let message = '🎾 Featured Matches:\n';
  
  highlightedMatches.forEach(match => {
    message += `\n⭐ ${match.opponent} - ${match.round}\n${match.time} on ${match.court || 'TBA'}\n`;
  });

  if (regularMatches.length > 0) {
    message += '\n\nOther Matches:\n';
    regularMatches.forEach(match => {
      message += `\n${match.opponent} - ${match.round}\n${match.time}\n`;
    });
  }

  return sendPushoverNotification(userKey, title, message);
}

function isHighProfileMatch(match: TennisMatch): boolean {
  // Logic to determine if a match is high profile
  // For now, just checking if it's a late-round match
  const lateRounds = ['Final', 'Semi-final', 'Quarter-final'];
  return lateRounds.includes(match.round);
} 