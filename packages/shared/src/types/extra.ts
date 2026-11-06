export * from './notification';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: string;
  criteria: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserAchievement {
  id: string;
  criteria: string;
  title: string;
  description: string;
  icon: string;
  category: string;
  unlocked: boolean;
  unlockedAt?: string;
  progress: {
    current: number;
    target: number;
    percentage: number;
  };
}

export type ResourceContentType = 'article' | 'audio' | 'guide' | 'helpline' | 'exercise';

export interface WellnessResource {
  id: string;
  title: string;
  description: string;
  category: string;
  contentType: ResourceContentType;
  contentUrl: string;
  language: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

