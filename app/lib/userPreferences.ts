import { readFile, writeFile } from 'fs/promises';
import path from 'path';

interface UserPreferences {
  email: string;
  pushoverKey?: string;
  favoritePlayers?: string[];
  notificationTime?: string;
  timezone?: string;
}

const PREFS_FILE = path.join(process.cwd(), 'data', 'userPreferences.json');

export async function getUserPreferences(): Promise<UserPreferences[]> {
  try {
    const data = await readFile(PREFS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    // If file doesn't exist, return empty array
    return [];
  }
}

export async function getUserPreferencesByEmail(email: string): Promise<UserPreferences | null> {
  const prefs = await getUserPreferences();
  return prefs.find(p => p.email === email) || null;
}

export async function updateUserPreferences(email: string, updates: Partial<UserPreferences>): Promise<boolean> {
  const prefs = await getUserPreferences();
  const userIndex = prefs.findIndex(p => p.email === email);

  if (userIndex === -1) {
    // Create new user preferences
    prefs.push({
      email,
      ...updates
    });
  } else {
    // Update existing preferences
    prefs[userIndex] = {
      ...prefs[userIndex],
      ...updates
    };
  }

  try {
    await writeFile(PREFS_FILE, JSON.stringify(prefs, null, 2));
    return true;
  } catch (error) {
    console.error('Error saving user preferences:', error);
    return false;
  }
} 