'use client';

import { useState } from 'react';
import { useTheme } from './ThemeProvider';

interface NotificationPreferencesProps {
  onSave: (preferences: NotificationPreferences) => void;
  initialPreferences?: NotificationPreferences;
}

export interface NotificationPreferences {
  pushoverKey: string;
  matchStartReminders: boolean;
  dailySchedule: boolean;
  favoritePlayersOnly: boolean;
  reminderTime: number; // minutes before match
  dailyScheduleTime: string; // HH:mm format
}

export default function NotificationPreferences({ onSave, initialPreferences }: NotificationPreferencesProps) {
  const { theme } = useTheme();
  const [preferences, setPreferences] = useState<NotificationPreferences>(initialPreferences || {
    pushoverKey: '',
    matchStartReminders: true,
    dailySchedule: true,
    favoritePlayersOnly: true,
    reminderTime: 15,
    dailyScheduleTime: '08:00',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(preferences);
  };

  return (
    <div className={`p-6 rounded-lg shadow-md ${
      theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white'
    }`}>
      <h2 className={`text-2xl font-bold mb-6 ${
        theme === 'dark' ? 'text-white' : 'text-gray-900'
      }`}>
        Notification Preferences
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block mb-2 font-medium">
            Pushover User Key
          </label>
          <input
            type="text"
            value={preferences.pushoverKey}
            onChange={(e) => setPreferences({ ...preferences, pushoverKey: e.target.value })}
            className={`w-full p-2 rounded border ${
              theme === 'dark'
                ? 'bg-gray-700 border-gray-600 text-white'
                : 'border-gray-300'
            }`}
            placeholder="Enter your Pushover user key"
          />
          <p className={`mt-1 text-sm ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
          }`}>
            You can find your user key in the Pushover dashboard
          </p>
        </div>

        <div className="space-y-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={preferences.matchStartReminders}
              onChange={(e) => setPreferences({ ...preferences, matchStartReminders: e.target.checked })}
              className="rounded border-gray-300 text-blue-600"
            />
            <span>Match start reminders</span>
          </label>

          {preferences.matchStartReminders && (
            <div className="ml-6">
              <label className="block mb-2">
                Minutes before match
                <input
                  type="number"
                  value={preferences.reminderTime}
                  onChange={(e) => setPreferences({ ...preferences, reminderTime: parseInt(e.target.value) })}
                  min="5"
                  max="60"
                  className={`ml-2 w-20 p-1 rounded border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'border-gray-300'
                  }`}
                />
              </label>
            </div>
          )}

          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={preferences.dailySchedule}
              onChange={(e) => setPreferences({ ...preferences, dailySchedule: e.target.checked })}
              className="rounded border-gray-300 text-blue-600"
            />
            <span>Daily schedule notification</span>
          </label>

          {preferences.dailySchedule && (
            <div className="ml-6">
              <label className="block mb-2">
                Schedule time
                <input
                  type="time"
                  value={preferences.dailyScheduleTime}
                  onChange={(e) => setPreferences({ ...preferences, dailyScheduleTime: e.target.value })}
                  className={`ml-2 p-1 rounded border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'border-gray-300'
                  }`}
                />
              </label>
            </div>
          )}

          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={preferences.favoritePlayersOnly}
              onChange={(e) => setPreferences({ ...preferences, favoritePlayersOnly: e.target.checked })}
              className="rounded border-gray-300 text-blue-600"
            />
            <span>Only notify about favorite players</span>
          </label>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className={`px-4 py-2 rounded-lg font-medium ${
              theme === 'dark'
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            Save Preferences
          </button>
        </div>
      </form>
    </div>
  );
} 