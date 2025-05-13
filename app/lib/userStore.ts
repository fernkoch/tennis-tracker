import fs from 'fs/promises';
import path from 'path';
import bcrypt from 'bcryptjs';
import { NotificationPreferences } from '../types/notifications';

const USERS_DIR = path.join(process.cwd(), 'data', 'users');

export interface UserPreferences extends NotificationPreferences {
  userId: string;
  username: string;
  email: string;
  favoritePlayerIds: string[];
  notificationType: 'email' | 'pushover';
  hasPassword?: boolean; // Whether the user has set a password
}

interface UserCredentials {
  passwordHash: string;
  rememberToken?: string;
  rememberTokenExpires?: Date;
}

export class UserStore {
  private static async ensureUserDirectory(userId: string) {
    const userDir = path.join(USERS_DIR, userId);
    await fs.mkdir(userDir, { recursive: true });
    return userDir;
  }

  private static async saveUserCredentials(userId: string, credentials: UserCredentials) {
    const userDir = await this.ensureUserDirectory(userId);
    const credsFile = path.join(userDir, 'credentials.json');
    await fs.writeFile(credsFile, JSON.stringify(credentials, null, 2));
    return true;
  }

  private static async getUserCredentials(userId: string): Promise<UserCredentials | null> {
    try {
      const userDir = await this.ensureUserDirectory(userId);
      const credsFile = path.join(userDir, 'credentials.json');
      const data = await fs.readFile(credsFile, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      return null;
    }
  }

  static async saveUserPreferences(preferences: UserPreferences) {
    const userDir = await this.ensureUserDirectory(preferences.userId);
    const prefsFile = path.join(userDir, 'preferences.json');
    await fs.writeFile(prefsFile, JSON.stringify(preferences, null, 2));
    return true;
  }

  static async getUserPreferences(userId: string): Promise<UserPreferences | null> {
    try {
      const userDir = await this.ensureUserDirectory(userId);
      const prefsFile = path.join(userDir, 'preferences.json');
      const data = await fs.readFile(prefsFile, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.error(`Error reading preferences for user ${userId}:`, error);
      return null;
    }
  }

  static async getUserByEmail(email: string): Promise<UserPreferences | null> {
    try {
      const users = await fs.readdir(USERS_DIR);
      for (const userId of users) {
        const prefs = await this.getUserPreferences(userId);
        if (prefs && prefs.email === email) {
          return prefs;
        }
      }
      return null;
    } catch (error) {
      console.error(`Error finding user by email ${email}:`, error);
      return null;
    }
  }

  static async setPassword(userId: string, password: string) {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    await this.saveUserCredentials(userId, { passwordHash });
    
    // Update user preferences to indicate they have a password
    const prefs = await this.getUserPreferences(userId);
    if (prefs) {
      await this.saveUserPreferences({ ...prefs, hasPassword: true });
    }
    
    return true;
  }

  static async verifyPassword(userId: string, password: string): Promise<boolean> {
    const credentials = await this.getUserCredentials(userId);
    if (!credentials?.passwordHash) return false;
    return bcrypt.compare(password, credentials.passwordHash);
  }

  static async setRememberToken(userId: string): Promise<string> {
    const token = await bcrypt.genSalt(16); // Generate a random token
    const expires = new Date();
    expires.setDate(expires.getDate() + 30); // 30 days from now

    const credentials = await this.getUserCredentials(userId) || { passwordHash: '' };
    await this.saveUserCredentials(userId, {
      ...credentials,
      rememberToken: token,
      rememberTokenExpires: expires
    });

    return token;
  }

  static async verifyRememberToken(userId: string, token: string): Promise<boolean> {
    const credentials = await this.getUserCredentials(userId);
    if (!credentials?.rememberToken || !credentials?.rememberTokenExpires) return false;
    
    const expires = new Date(credentials.rememberTokenExpires);
    if (expires < new Date()) return false;
    
    return credentials.rememberToken === token;
  }

  static async createDefaultPreferences(userId: string, username: string): Promise<UserPreferences> {
    const defaults: UserPreferences = {
      userId,
      username,
      email: '',
      hasPassword: false,
      notificationType: 'email',
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

    await this.saveUserPreferences(defaults);
    return defaults;
  }
} 