'use client';

import NotificationPreferences from './NotificationPreferences';
import { useTheme } from './ThemeProvider';

export default function NotificationSettings() {
  const { theme } = useTheme();

  const handleSavePreferences = async (preferences: any) => {
    try {
      const response = await fetch('/api/user/preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(preferences),
      });

      if (!response.ok) {
        throw new Error('Failed to save preferences');
      }
    } catch (error) {
      console.error('Error saving preferences:', error);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Notification Settings</h2>
      <NotificationPreferences
        onSave={handleSavePreferences}
      />
    </div>
  );
} 