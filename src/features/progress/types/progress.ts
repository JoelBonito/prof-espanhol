export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export interface AreaScore {
    score: number;
    level: CEFRLevel;
    trend: 'up' | 'down' | 'stable';
    lastChange: number; // Delta from previous
}

export interface PhonemeStats {
    phoneme: string;
    status: 'improved' | 'pending' | 'untested';
    attempts: number;
    accuracy: number;
}

export interface WeeklyActivity {
    day: string; // ISO date or day name
    completed: number;
    scheduled: number;
}

export interface UserProgress {
    grammar: AreaScore;
    vocabulary: AreaScore;
    pronunciation: AreaScore;
    phonemes: PhonemeStats[];
    weeklyActivity: WeeklyActivity[];
    lastAutomaticReport?: string; // Date of last report
}
