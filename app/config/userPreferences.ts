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

export const notificationSettings = {
  // Add any additional notification settings here
  highPriorityForFavorites: true,
  quietHoursStart: '23:00',
  quietHoursEnd: '07:00',
}; 