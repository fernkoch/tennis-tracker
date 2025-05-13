'use client';

import RankingsTable from '../components/RankingsTable';
import { mockRankings } from '../data/rankings';
import { useTheme } from '../components/ThemeProvider';

export default function RankingsPage() {
  const { theme } = useTheme();
  
  return (
    <main className={`min-h-screen py-12 px-4 sm:px-6 lg:px-8 ${
      theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className={`text-4xl font-bold mb-2 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            ATP Live Rankings
          </h1>
          <p className={`text-xl ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Live tennis rankings during Rome Masters 2025
          </p>
        </div>
        
        <div className={`shadow rounded-lg ${
          theme === 'dark' ? 'bg-gray-800' : 'bg-white'
        }`}>
          <RankingsTable rankings={mockRankings} />
        </div>

        <div className={`mt-8 text-sm ${
          theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
        }`}>
          <p>* Rankings are updated live during tournaments</p>
          <p>* Points to defend are from the corresponding tournament in the previous year</p>
          <p>* Tournament points show points earned in the current tournament</p>
        </div>
      </div>
    </main>
  );
} 