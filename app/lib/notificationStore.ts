import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';

export interface NotificationHistory {
  id: string;
  notification: {
    type: 'match_start' | 'daily_schedule';
    matchId?: string;
    message: string;
    timestamp: Date;
    priority: number;
  };
  status: 'pending' | 'sent' | 'failed';
  createdAt: Date;
  deliveredAt?: Date;
  error?: string;
}

class NotificationStore {
  private static dataPath = path.join(process.cwd(), 'data', 'notifications.json');

  private static ensureDataDirectory() {
    const dir = path.dirname(this.dataPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  private static async readNotifications(): Promise<NotificationHistory[]> {
    try {
      this.ensureDataDirectory();
      if (!fs.existsSync(this.dataPath)) {
        return [];
      }
      const data = await fs.promises.readFile(this.dataPath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error reading notifications:', error);
      return [];
    }
  }

  private static async writeNotifications(notifications: NotificationHistory[]) {
    try {
      this.ensureDataDirectory();
      await fs.promises.writeFile(
        this.dataPath,
        JSON.stringify(notifications, null, 2)
      );
    } catch (error) {
      console.error('Error writing notifications:', error);
    }
  }

  static async addNotification(notification: Omit<NotificationHistory, 'id' | 'createdAt'>) {
    const notifications = await this.readNotifications();
    const newNotification: NotificationHistory = {
      id: uuidv4(),
      ...notification,
      createdAt: new Date()
    };
    notifications.push(newNotification);
    await this.writeNotifications(notifications);
    return newNotification;
  }

  static async updateNotification(id: string, update: Partial<NotificationHistory>) {
    const notifications = await this.readNotifications();
    const index = notifications.findIndex(n => n.id === id);
    if (index === -1) return null;

    notifications[index] = { ...notifications[index], ...update };
    await this.writeNotifications(notifications);
    return notifications[index];
  }

  static async getRecentNotifications(limit = 50): Promise<NotificationHistory[]> {
    const notifications = await this.readNotifications();
    return notifications
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  static async cleanOldNotifications(daysToKeep = 7) {
    const notifications = await this.readNotifications();
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - daysToKeep);

    const filtered = notifications.filter(n => 
      new Date(n.createdAt).getTime() > cutoff.getTime()
    );

    if (filtered.length < notifications.length) {
      await this.writeNotifications(filtered);
    }
  }
}

export { NotificationStore }; 