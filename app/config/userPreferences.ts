import { NotificationPreferences } from '../components/NotificationPreferences';

// This will be replaced with a proper user system later
export const userPreferences: NotificationPreferences = {
  pushoverKey: process.env.NEXT_PUBLIC_PUSHOVER_USER_KEY || '',
  matchStartReminders: true,
  dailySchedule: true,
  favoritePlayersOnly: true,
  reminderTime: 15,
  dailyScheduleTime: '08:00',
};

// Store favorites in localStorage to persist them
export function getFavoritePlayerIds(): string[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem('favoritePlayerIds');
  return stored ? JSON.parse(stored) : [];
}

export function toggleFavoritePlayer(playerId: string): void {
  const favorites = getFavoritePlayerIds();
  const index = favorites.indexOf(playerId);
  
  if (index === -1) {
    favorites.push(playerId);
  } else {
    favorites.splice(index, 1);
  }
  
  localStorage.setItem('favoritePlayerIds', JSON.stringify(favorites));
}

export interface NotificationPreferences {
  pushoverKey?: string;
  matchStartReminders: boolean;
  dailySchedule: boolean;
  favoritePlayersOnly: boolean;
  reminderTime: number;
  dailyScheduleTime: string;
}

// Default preferences
export const defaultPreferences: NotificationPreferences = {
  matchStartReminders: true,
  dailySchedule: true,
  favoritePlayersOnly: true,
  reminderTime: 15,
  dailyScheduleTime: '08:00'
};

export const notificationSettings = {
  highPriorityForFavorites: true,
  quietHoursStart: '23:00',
  quietHoursEnd: '07:00'
}; 