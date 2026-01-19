export enum MomPersonality {
  NAGGING = '唠叨型',
  SWEET = '温柔型',
  DRAMATIC = '戏精型',
  SKEPTICAL = '怀疑型',
}

export interface CheckInRecord {
  id: string;
  timestamp: number; // Unix timestamp
  dateStr: string; // YYYY-MM-DD
  momResponse: string;
  mood: string;
}

export interface AppState {
  streak: number;
  lastCheckInDate: string | null; // YYYY-MM-DD
  history: CheckInRecord[];
  personality: MomPersonality;
}

export interface DailyStats {
  day: string;
  count: number;
}