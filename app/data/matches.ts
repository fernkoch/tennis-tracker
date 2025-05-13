import { TennisMatch } from '../types/match';

export const upcomingMatches: TennisMatch[] = [
  {
    id: '1',
    opponent: 'Novak Djokovic',
    tournament: 'Indian Wells Masters',
    date: '2024-03-15',
    time: '19:00',
    round: 'Semi-final',
    surface: 'Hard'
  },
  {
    id: '2',
    opponent: 'Jannik Sinner',
    tournament: 'Miami Open',
    date: '2024-03-27',
    time: '20:30',
    round: 'Quarter-final',
    surface: 'Hard'
  },
  {
    id: '3',
    opponent: 'Daniil Medvedev',
    tournament: 'Monte-Carlo Masters',
    date: '2024-04-10',
    time: '14:00',
    round: 'Final',
    surface: 'Clay'
  },
  {
    id: '4',
    opponent: 'Alexander Zverev',
    tournament: 'Barcelona Open',
    date: '2024-04-20',
    time: '16:00',
    round: 'Semi-final',
    surface: 'Clay'
  }
]; 