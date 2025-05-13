export interface PlayerRanking {
  rank: number;
  previousRank: number;
  name: string;
  country: string;
  points: number;
  pointsToDefend: number;
  pointsDefendedThisWeek: number;
  tournamentPoints: number;
  rankChange: number;
  age: number;
  isFollowed?: boolean;
  notificationsEnabled?: boolean;
  recentResults?: {
    tournament: string;
    round: string;
    result: string;
    pointsEarned: number;
  }[];
}

export interface RankingFilters {
  onlyFollowed: boolean;
  countryFilter?: string;
  ageRange?: {
    min: number;
    max: number;
  };
  rankRange?: {
    min: number;
    max: number;
  };
} 