'use client';

import { useState } from 'react';
import { useTheme } from './ThemeProvider';
import { TennisMatch } from '../types/match';

interface ScheduleAssistantProps {
  matches: TennisMatch[];
  onEnableReminder: (matchId: string) => void;
}

export default function ScheduleAssistant({ matches, onEnableReminder }: ScheduleAssistantProps) {
  const { theme } = useTheme();
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Here we'll integrate with Claude/ChatGPT
    // For now, let's do simple keyword matching
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('when') || lowerQuery.includes('what time')) {
      const playerName = extractPlayerName(query);
      const playerMatch = matches.find(m => 
        m.opponent.toLowerCase().includes(playerName.toLowerCase())
      );

      if (playerMatch) {
        setResponse(`${playerMatch.opponent} plays at ${playerMatch.time} on ${playerMatch.court || 'TBA'} (${playerMatch.round})`);
      } else {
        setResponse("I couldn't find that player in today's schedule.");
      }
    } else if (lowerQuery.includes('remind') || lowerQuery.includes('notification')) {
      const playerName = extractPlayerName(query);
      const playerMatch = matches.find(m => 
        m.opponent.toLowerCase().includes(playerName.toLowerCase())
      );

      if (playerMatch) {
        onEnableReminder(playerMatch.id);
        setResponse(`I've set a reminder for the match against ${playerMatch.opponent}.`);
      } else {
        setResponse("I couldn't find that player in today's schedule.");
      }
    } else if (lowerQuery.includes('important') || lowerQuery.includes('highlight')) {
      const importantMatches = matches.filter(m => 
        m.round.includes('Final') || m.round.includes('Semi')
      );

      if (importantMatches.length > 0) {
        const matchList = importantMatches
          .map(m => `${m.opponent} (${m.round}) at ${m.time}`)
          .join('\n');
        setResponse(`Here are today's highlighted matches:\n\n${matchList}`);
      } else {
        setResponse("There are no major matches scheduled for today.");
      }
    } else {
      setResponse("I can help you find match times, set reminders, or show you the important matches of the day. Try asking something like 'When does Alcaraz play?' or 'Remind me about Djokovic's match'");
    }

    setQuery('');
  };

  function extractPlayerName(query: string): string {
    // Simple extraction - could be improved with NLP
    const words = query.split(' ');
    const commonWords = ['when', 'does', 'is', 'playing', 'remind', 'me', 'about', 'match'];
    return words
      .filter(word => !commonWords.includes(word.toLowerCase()))
      .join(' ')
      .trim();
  }

  return (
    <div className={`p-6 rounded-lg shadow-md ${
      theme === 'dark' ? 'bg-gray-800' : 'bg-white'
    }`}>
      <h3 className={`text-lg font-semibold mb-4 ${
        theme === 'dark' ? 'text-white' : 'text-gray-900'
      }`}>
        Schedule Assistant
      </h3>

      <form onSubmit={handleSubmit} className="mb-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask about match times or set reminders..."
            className={`flex-1 p-2 rounded-lg border ${
              theme === 'dark'
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                : 'border-gray-300 placeholder-gray-500'
            }`}
          />
          <button
            type="submit"
            className={`px-4 py-2 rounded-lg font-medium ${
              theme === 'dark'
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            Ask
          </button>
        </div>
      </form>

      {response && (
        <div className={`mt-4 p-4 rounded-lg ${
          theme === 'dark' ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-700'
        }`}>
          <pre className="whitespace-pre-wrap font-sans text-sm">
            {response}
          </pre>
        </div>
      )}
    </div>
  );
} 