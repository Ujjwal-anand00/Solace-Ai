export interface DailyPlanTask {
  id: string;
  day: number;
  title: string;
  description: string;
  category: string;
  durationMinutes: number;
  completed: boolean;
  completedAt?: string;
  skipped?: boolean;
}

export type PlanStatus = 'active' | 'completed' | 'paused' | 'abandoned';

export type WellnessPlanFocusArea =
  | 'stress'
  | 'sleep'
  | 'emotional-awareness'
  | 'mindfulness'
  | 'confidence'
  | 'habits'
  | 'self-care'
  | 'gratitude'
  | 'growth'
  | string;

export interface GenerateWellnessPlanDto {
  focusAreas: string[];
  durationDays: number;
  dailyMinutes: number;
  preferredActivities?: string[];
}

export interface CreateWellnessPlanDto {
  title: string;
  description: string;
  durationDays: number;
  focusAreas: string[];
  dailyTasks: Array<{
    id?: string;
    day: number;
    title: string;
    description: string;
    category: string;
    durationMinutes: number;
  }>;
  replaceActive?: boolean;
  isAiGenerated?: boolean;
}

export interface UpdateWellnessPlanDto {
  title?: string;
  description?: string;
}

export interface WellnessPlan {
  id: string;
  userId: string;
  title: string;
  description: string;
  durationDays: number;
  focusAreas: string[];
  goals?: string[];
  dailyTasks: DailyPlanTask[];
  startDate: string;
  endDate: string;
  status: PlanStatus;
  progress: number; // 0 to 100 percentage
  isAiGenerated?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PersonalizedRecommendation {
  activityId: string;
  slug?: string;
  title: string;
  description: string;
  category: string;
  duration: number; // seconds
  difficulty: string;
  reason: string;
}
