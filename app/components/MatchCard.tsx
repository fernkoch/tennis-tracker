'use client';

import { useState, useEffect } from 'react';
import { TennisMatch } from '../types/match';
import { BellIcon, StarIcon } from '@heroicons/react/24/outline';
import { BellIcon as BellIconSolid, StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { useTheme } from './ThemeProvider';
import { useRouter } from 'next/navigation';

interface MatchCardProps {
  match: TennisMatch;
}

export default function MatchCard({ match }: MatchCardProps) {
  const [isFollowed, setIsFollowed] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { theme } = useTheme();
  const router = useRouter();

  useEffect(() => {
    // Load user preferences
    fetchUserPreferences();
  }, [match.id]);

  const fetchUserPreferences = async () => {
    try {
      const response = await fetch('/api/user/preferences');
      if (response.ok) {
        const prefs = await response.json();
        setIsFollowed(prefs.favoritePlayerIds.includes(match.id));
        setNotificationsEnabled(prefs.notificationTypes?.match_start?.enabled || false);
      }
    } catch (error) {
      console.error('Error fetching preferences:', error);
    }
  };

  const toggleNotifications = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/user/preferences', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notificationTypes: {
            match_start: {
              enabled: !notificationsEnabled,
              priority: 1
            }
          }
        }),
      });

      if (response.status === 401) {
        // Not authenticated, redirect to sign in
        router.push('/signin');
        return;
      }

      if (response.ok) {
        setNotificationsEnabled(!notificationsEnabled);
      } else {
        console.error('Failed to update notifications');
      }
    } catch (error) {
      console.error('Error updating notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLoading(true);
    try {
      const response = await fetch('/api/user/preferences', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          favoritePlayerIds: isFollowed 
            ? [] // Remove from favorites
            : [match.id] // Add to favorites
        }),
      });

      if (response.status === 401) {
        // Not authenticated, redirect to sign in
        router.push('/signin');
        return;
      }

      if (response.ok) {
        setIsFollowed(!isFollowed);
      } else {
        console.error('Failed to update favorites');
      }
    } catch (error) {
      console.error('Error updating favorites:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`rounded-lg shadow-md p-6 hover:shadow-lg transition-all ${
      theme === 'dark' ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'
    }`}>
      <div className="flex flex-col space-y-2">
        <div className="flex items-center justify-between">
          <h3 className={`text-xl font-semibold ${
            theme === 'dark' ? 'text-white' : 'text-gray-800'
          }`}>
            vs. {match.opponent}
          </h3>
          <span className={`text-sm font-medium ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
          }`}>
            {match.round}
          </span>
        </div>
        <div className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
          <p className="font-medium">{match.tournament}</p>
          <p className="text-sm">Surface: {match.surface}</p>
          {match.court && <p className="text-sm">Court: {match.court}</p>}
        </div>
        <div className="flex items-center justify-between mt-2">
          <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            <p>{new Date(match.date).toLocaleDateString()}</p>
            <p>{match.time}</p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handleToggleFavorite}
              disabled={isLoading}
              className={`p-2 rounded-full transition-colors ${
                theme === 'dark'
                  ? isFollowed
                    ? 'text-yellow-400 bg-gray-700/50 hover:bg-gray-600/50'
                    : 'text-gray-400 hover:text-yellow-400 bg-transparent hover:bg-gray-700/50'
                  : isFollowed
                    ? 'text-yellow-500 bg-gray-100/50 hover:bg-gray-200/50'
                    : 'text-gray-400 hover:text-yellow-500 bg-transparent hover:bg-gray-100/50'
              }`}
              title={isFollowed ? 'Remove from favorites' : 'Add to favorites'}
            >
              {isFollowed ? (
                <StarIconSolid className="h-5 w-5" />
              ) : (
                <StarIcon className="h-5 w-5" />
              )}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleNotifications();
              }}
              disabled={isLoading}
              className={`p-2 rounded-full transition-colors ${
                theme === 'dark'
                  ? notificationsEnabled
                    ? 'text-blue-400 bg-gray-700/50 hover:bg-gray-600/50'
                    : 'text-gray-400 hover:text-blue-400 bg-transparent hover:bg-gray-700/50'
                  : notificationsEnabled
                    ? 'text-blue-500 bg-gray-100/50 hover:bg-gray-200/50'
                    : 'text-gray-400 hover:text-blue-500 bg-transparent hover:bg-gray-100/50'
              }`}
              title={notificationsEnabled ? 'Disable match reminder' : 'Enable match reminder'}
            >
              {notificationsEnabled ? (
                <BellIconSolid className="h-5 w-5" />
              ) : (
                <BellIcon className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 