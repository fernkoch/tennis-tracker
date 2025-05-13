'use client';

import { useEffect, useState } from 'react';
import { TennisMatch } from './types/match';
import MatchCard from './components/MatchCard';
import { useTheme } from './components/ThemeProvider';
import { BellIcon, NewspaperIcon, StarIcon, ChatBubbleBottomCenterTextIcon } from '@heroicons/react/24/outline';

const features = [
  {
    icon: BellIcon,
    title: 'Real-time Match Notifications',
    description: 'Get instant alerts for match starts, key moments, and results for your favorite players.'
  },
  {
    icon: NewspaperIcon,
    title: 'Press Conference Updates',
    description: 'Access post-match press conference transcripts and summaries, straight to your inbox.'
  },
  {
    icon: StarIcon,
    title: 'Personalized Experience',
    description: 'Follow your favorite players and receive customized notifications that matter to you.'
  },
  {
    icon: ChatBubbleBottomCenterTextIcon,
    title: 'Match Insights',
    description: 'Get AI-powered match summaries and key statistics during and after matches.'
  }
];

export default function HomePage() {
  const [matches, setMatches] = useState<TennisMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      const response = await fetch('/api/matches');
      if (response.ok) {
        const data = await response.json();
        setMatches(data);
      }
    } catch (error) {
      console.error('Error fetching matches:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={`min-h-screen py-8 px-4 sm:px-6 lg:px-8 ${
      theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className={`text-4xl font-bold mb-2 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Today's Tennis Matches
          </h1>
          <p className={`text-xl ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Live schedule and updates from major tournaments
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : matches.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {matches.map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        ) : (
          <div className={`text-center py-12 ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            <p className="text-xl">No matches scheduled for today</p>
            <p className="mt-2">Check back later for upcoming matches</p>
          </div>
        )}
      </div>
    </main>
  );
} 