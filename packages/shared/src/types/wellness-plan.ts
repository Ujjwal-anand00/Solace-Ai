export interface DailyPlanTask {
  id: string;
  title: string;
  category: string;
  durationMinutes: number;
  completed: boolean;
}

export type PlanStatus = 'active' | 'completed' | 'paused' | 'abandoned';

export interface WellnessPlan {
  id: string;
  userId: string;
  title: string;
  description: string;
  goals: string[];
  dailyTasks: DailyPlanTask[];
  startDate: string;
  endDate: string;
  status: PlanStatus;
  progress: number; // 0 to 100 percentage
  createdAt: string;
  updatedAt: string;
}
