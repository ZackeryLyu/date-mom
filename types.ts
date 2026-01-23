
export interface CheckInRecord {
  id: string;
  timestamp: number; // Unix timestamp
  dateStr: string; // YYYY-MM-DD
  reportMessage: string;
  mood: string;
}

export interface AppState {
  streak: number;
  lastCheckInDate: string | null; // YYYY-MM-DD
  history: CheckInRecord[];
}

export interface DailyStats {
  day: string;
  count: number;
}
