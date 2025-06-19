export interface RoutineStep {
  id: string;
  name: string;
  description?: string;
  waitTime?: number; // in minutes
  isOptional?: boolean;
  warning?: string;
  incompatibleWith?: string[];
}

export type RoutineType = 'morning' | 'evening';

export interface DayRoutine {
  morning: RoutineStep[];
  evening: RoutineStep[];
}

export interface ProgressData {
  [stepId: string]: boolean;
}

export interface TimerState {
  stepId: string;
  timeRemaining: number;
  isActive: boolean;
  isPaused: boolean;
}