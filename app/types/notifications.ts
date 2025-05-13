export type NotificationType = 
  | 'match_start'
  | 'match_end'
  | 'set_start'
  | 'set_end'
  | 'tiebreak'
  | 'break_point'
  | 'match_point'
  | 'score_update';

export interface NotificationPreferences {
  pushoverKey?: string;
  matchStartReminders: boolean;
  dailySchedule: boolean;
  favoritePlayersOnly: boolean;
  reminderTime: number; // minutes before match
  dailyScheduleTime: string; // HH:mm format
  notificationTypes: {
    [key in NotificationType]: {
      enabled: boolean;
      priority: number; // -2 to 2 for Pushover
    }
  };
  quietHours: {
    enabled: boolean;
    start: string; // HH:mm format
    end: string; // HH:mm format
  };
}

export interface MatchNotification {
  type: NotificationType;
  matchId: string;
  message: string;
  timestamp: Date;
  priority: number; // -2 to 2 for Pushover
  data?: {
    score?: string;
    currentSet?: number;
    currentGame?: number;
    server?: string;
  };
}

// For storing notification history
export interface NotificationHistory {
  id: string;
  notification: MatchNotification;
  status: 'sent' | 'failed' | 'pending';
  createdAt: Date;
  deliveredAt?: Date;
  error?: string;
}

export interface MatchState {
  currentSet: number;
  currentGame: number;
  score: string;
  isMatchPoint: boolean;
  isBreakPoint: boolean;
  isTiebreak: boolean;
  isComplete: boolean;
} 