import fs from 'fs/promises';
import path from 'path';
import { NotificationHistory } from '../types/notifications';

const STORAGE_FILE = path.join(process.cwd(), 'data', 'notifications.json');

export class NotificationStore {
  private static async ensureStorageFile() {
    try {
      await fs.mkdir(path.dirname(STORAGE_FILE), { recursive: true });
      try {
        await fs.access(STORAGE_FILE);
      } catch {
        await fs.writeFile(STORAGE_FILE, JSON.stringify([]));
      }
    } catch (error) {
      console.error('Error ensuring storage file:', error);
    }
  }

  static async addNotification(notification: NotificationHistory) {
    await this.ensureStorageFile();
    
    try {
      const notifications = await this.getNotifications();
      notifications.push(notification);
      
      // Keep only last 100 notifications
      if (notifications.length > 100) {
        notifications.splice(0, notifications.length - 100);
      }
      
      await fs.writeFile(STORAGE_FILE, JSON.stringify(notifications, null, 2));
      return true;
    } catch (error) {
      console.error('Error adding notification:', error);
      return false;
    }
  }

  static async getNotifications(): Promise<NotificationHistory[]> {
    await this.ensureStorageFile();
    
    try {
      const data = await fs.readFile(STORAGE_FILE, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error reading notifications:', error);
      return [];
    }
  }

  static async getNotificationsByMatch(matchId: string): Promise<NotificationHistory[]> {
    const notifications = await this.getNotifications();
    return notifications.filter(n => n.notification.matchId === matchId);
  }
} 