import { TennisMatch } from '../types/match';
import { NotificationType, MatchNotification } from '../types/notifications';

class NotificationScheduler {
  private scheduledNotifications: Map<string, NodeJS.Timeout> = new Map();

  async sendNotification(notification: MatchNotification) {
    try {
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(notification),
      });

      if (!response.ok) {
        throw new Error('Failed to send notification');
      }

      return await response.json();
    } catch (error) {
      console.error('Error sending notification:', error);
      throw error;
    }
  }

  scheduleMatchReminder(match: TennisMatch) {
    const matchTime = new Date(match.date + ' ' + match.time);
    const now = new Date();
    const timeUntilMatch = matchTime.getTime() - now.getTime();

    if (timeUntilMatch <= 0) {
      console.warn('Match time has already passed');
      return;
    }

    // Cancel any existing reminder for this match
    this.cancelMatchReminder(match.id);

    // Schedule 15-minute reminder
    const reminderTimeout = setTimeout(async () => {
      await this.sendNotification({
        type: 'match_start',
        matchId: match.id,
        message: `Match starting soon: ${match.opponent} at ${match.time}`,
        timestamp: new Date(),
        priority: 1
      });
    }, timeUntilMatch - 15 * 60 * 1000);

    this.scheduledNotifications.set(match.id, reminderTimeout);
  }

  cancelMatchReminder(matchId: string) {
    const existingTimeout = this.scheduledNotifications.get(matchId);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
      this.scheduledNotifications.delete(matchId);
    }
  }

  async scheduleMatchUpdates(match: TennisMatch) {
    // We'll implement live match updates here later
    // This will include set scores, tiebreaks, etc.
  }
}

export const notificationScheduler = new NotificationScheduler(); 