import { TennisMatch } from '../types/match';
import { romeMatches } from '../data/rome_matches';

const TENNIS_API_KEY = process.env.NEXT_PUBLIC_TENNIS_API_KEY || 'YOUR_API_KEY';
const CACHE_DURATION = 3600000; // 1 hour in milliseconds

let cachedMatches: TennisMatch[] | null = null;
let lastFetchTime: number = 0;

export async function getUpcomingMatches(): Promise<TennisMatch[]> {
  try {
    // Check if we have cached data that's still valid
    if (cachedMatches && (Date.now() - lastFetchTime) < CACHE_DURATION) {
      return cachedMatches;
    }

    // Get today's date in YYYY-MM-DD format
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    
    // Get matches for today
    const response = await fetch(`https://tennis-live-data.p.rapidapi.com/matches-by-date/${formattedDate}`, {
      method: 'GET',
      headers: {
        'X-RapidAPI-Host': 'tennis-live-data.p.rapidapi.com',
        'X-RapidAPI-Key': TENNIS_API_KEY
      }
    });

    if (!response.ok) {
      console.error('API request failed:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      });
      return getMockMatches();
    }

    const data = await response.json();
    
    // Transform the API response into our TennisMatch format
    const matches = data.results
      ?.filter((match: any) => 
        match.player1?.name?.toLowerCase().includes('alcaraz') ||
        match.player2?.name?.toLowerCase().includes('alcaraz')
      )
      .map((match: any) => ({
        id: match.id?.toString() || Math.random().toString(),
        opponent: match.player1?.name?.toLowerCase().includes('alcaraz') 
          ? match.player2?.name 
          : match.player1?.name,
        tournament: match.tournament?.name || 'Unknown Tournament',
        date: match.date || formattedDate,
        time: match.time || 'TBD',
        round: match.round || 'TBD',
        surface: getSurfaceFromTournament(match.tournament?.name || '')
      })) || [];

    if (matches.length === 0) {
      console.log('No matches found for Alcaraz today, using mock data');
      return getMockMatches();
    }

    // Cache the results
    cachedMatches = matches;
    lastFetchTime = Date.now();

    return matches;
  } catch (error) {
    console.error('Error fetching tennis matches:', error);
    return getMockMatches();
  }
}

// Helper function to determine surface based on tournament name
function getSurfaceFromTournament(tournament: string): string {
  const tournamentLower = tournament?.toLowerCase() || '';
  if (tournamentLower.includes('roland garros') || tournamentLower.includes('madrid') || 
      tournamentLower.includes('rome') || tournamentLower.includes('monte carlo')) {
    return 'Clay';
  } else if (tournamentLower.includes('wimbledon')) {
    return 'Grass';
  } else if (tournamentLower.includes('us open') || tournamentLower.includes('australian open') ||
             tournamentLower.includes('indian wells') || tournamentLower.includes('miami')) {
    return 'Hard';
  }
  return 'TBD';
}

// Mock data for development and fallback
function getMockMatches(): TennisMatch[] {
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  
  // If today is May 13, return Rome Masters Round of 16 matches
  if (todayStr.endsWith('-05-13')) {
    return romeMatches;
  }

  // Otherwise return default mock matches
  return [
    {
      id: '1',
      opponent: 'Jannik Sinner',
      tournament: 'Rome Masters',
      date: todayStr,
      time: '15:00',
      round: 'Quarter-final',
      surface: 'Clay',
      court: 'Campo Centrale'
    },
    {
      id: '2',
      opponent: 'Novak Djokovic',
      tournament: 'Roland Garros',
      date: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      time: '14:30',
      round: 'Semi-final',
      surface: 'Clay',
      court: 'Philippe Chatrier'
    },
    {
      id: '3',
      opponent: 'Daniil Medvedev',
      tournament: 'Roland Garros',
      date: new Date(today.getTime() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      time: '15:30',
      round: 'Final',
      surface: 'Clay',
      court: 'Philippe Chatrier'
    }
  ];
} 