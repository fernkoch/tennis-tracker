import { format } from 'date-fns';

interface Match {
  id: string;
  tournament: {
    name: string;
    category: string;
    surface: string;
  };
  homePlayer: {
    name: string;
    ranking: number;
  };
  awayPlayer: {
    name: string;
    ranking: number;
  };
  scheduledTime: string;
  round: string;
  odds?: {
    homeWin: number;
    awayWin: number;
  };
}

interface H2HStats {
  matches: number;
  homeWins: number;
  awayWins: number;
  lastMatch?: {
    date: string;
    winner: string;
    score: string;
    surface: string;
  };
}

interface TournamentDraw {
  round: string;
  matches: Match[];
}

export class ApiTennisService {
  private static API_BASE = 'https://api.api-tennis.com/tennis';
  private static API_KEY = process.env.API_TENNIS_TOKEN;

  private static async fetchFromApi(method: string, params: Record<string, string> = {}): Promise<any> {
    const queryParams = new URLSearchParams({
      method,
      APIkey: this.API_KEY || '',
      ...params
    });

    const url = `${this.API_BASE}/?${queryParams}`;
    console.log('Fetching from:', url);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`API Tennis error: ${response.statusText}`);
    }

    const data = await response.json();
    if (!data.success) {
      throw new Error(`API Tennis error: ${data.error || 'Unknown error'}`);
    }

    return data.result;
  }

  static async getDailySchedule(date: Date = new Date()): Promise<Match[]> {
    // Ensure we're using today's date if the provided date is in the future
    const today = new Date();
    const targetDate = date > today ? today : date;
    
    const formattedDate = format(targetDate, 'yyyy-MM-dd');
    console.log('Fetching from:', `${this.API_BASE}/?method=get_fixtures&APIkey=${this.API_KEY}&date_start=${formattedDate}&date_stop=${formattedDate}`);
    
    const data = await this.fetchFromApi('get_fixtures', {
      date_start: formattedDate,
      date_stop: formattedDate
    });
    
    // Transform the API response into our Match interface
    return data.map((match: any) => ({
      id: match.event_key,
      tournament: {
        name: match.tournament_name,
        category: match.event_type_type,
        surface: match.tournament_surface || 'Unknown'
      },
      homePlayer: {
        name: match.event_first_player,
        ranking: match.first_player_ranking || 0
      },
      awayPlayer: {
        name: match.event_second_player,
        ranking: match.second_player_ranking || 0
      },
      scheduledTime: `${match.event_date} ${match.event_time}`,
      round: match.tournament_round || 'Unknown',
      odds: match.odds ? {
        homeWin: parseFloat(match.odds.home_win) || 0,
        awayWin: parseFloat(match.odds.away_win) || 0
      } : undefined
    }));
  }

  static async getHeadToHead(player1: string, player2: string): Promise<H2HStats | null> {
    try {
      const data = await this.fetchFromApi('get_H2H', {
        first_player_key: player1,
        second_player_key: player2
      });

      return {
        matches: data.total_matches || 0,
        homeWins: data.player1_wins || 0,
        awayWins: data.player2_wins || 0,
        lastMatch: data.last_match ? {
          date: data.last_match.date,
          winner: data.last_match.winner,
          score: data.last_match.score,
          surface: data.last_match.surface
        } : undefined
      };
    } catch (error) {
      console.error('Error fetching H2H stats:', error);
      return null;
    }
  }

  static async getTournamentDraw(tournamentId: string): Promise<TournamentDraw[]> {
    try {
      const data = await this.fetchFromApi('get_tournament_draw', {
        tournament_id: tournamentId
      });

      return data.rounds.map((round: any) => ({
        round: round.name,
        matches: round.matches.map((match: any) => ({
          id: match.id,
          tournament: {
            name: match.tournament.name,
            category: match.tournament.category,
            surface: match.tournament.surface
          },
          homePlayer: {
            name: match.player1.name,
            ranking: match.player1.ranking
          },
          awayPlayer: {
            name: match.player2.name,
            ranking: match.player2.ranking
          },
          scheduledTime: match.scheduled_at,
          round: match.round
        }))
      }));
    } catch (error) {
      console.error('Error fetching tournament draw:', error);
      return [];
    }
  }

  static isMajorMatch(match: Match): boolean {
    // Check if it's a major tournament or involves top players
    const majorTournaments = ['ATP', 'WTA', 'Grand Slam', 'Masters'];
    const isTopPlayer = (name: string) => 
      ['Alcaraz', 'Zverev', 'Sinner', 'Medvedev', 'Djokovic', 'Swiatek', 'Sabalenka', 'Gauff'].some(player => 
        name.toLowerCase().includes(player.toLowerCase())
      );

    return majorTournaments.some(t => match.tournament.category.includes(t)) ||
           isTopPlayer(match.homePlayer.name) ||
           isTopPlayer(match.awayPlayer.name);
  }

  static getPotentialNextOpponent(matches: Match[], currentMatch: Match): Match | null {
    // Find matches in the same tournament and round that could lead to next round
    const sameTournamentMatches = matches.filter(m => 
      m.tournament.name === currentMatch.tournament.name &&
      m.round === currentMatch.round &&
      m.id !== currentMatch.id
    );

    if (sameTournamentMatches.length === 0) return null;

    // Return the match with the highest ranked player as the likely next opponent
    return sameTournamentMatches.reduce((likely, match) => {
      const likelyBestRank = Math.min(likely.homePlayer.ranking, likely.awayPlayer.ranking);
      const matchBestRank = Math.min(match.homePlayer.ranking, match.awayPlayer.ranking);
      return matchBestRank < likelyBestRank ? match : likely;
    });
  }

  static getMatchFavorite(match: Match): 'home' | 'away' | 'even' {
    if (match.odds) {
      // Use betting odds if available
      if (match.odds.homeWin < match.odds.awayWin) return 'home';
      if (match.odds.awayWin < match.odds.homeWin) return 'away';
      return 'even';
    }
    
    // Fallback to ranking comparison
    if (match.homePlayer.ranking < match.awayPlayer.ranking) return 'home';
    if (match.awayPlayer.ranking < match.homePlayer.ranking) return 'away';
    return 'even';
  }
} 