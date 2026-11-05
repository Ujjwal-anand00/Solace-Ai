export type NotificationType = 'reminder' | 'affirmation' | 'streak_alert' | 'checkin' | 'system';
export type NotificationStatus = 'pending' | 'sent' | 'read' | 'failed' | 'cancelled';

export interface SolaceNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  scheduledAt?: string;
  sentAt?: string;
  status: NotificationStatus;
  relatedResourceId?: string;
  createdAt: string;
  updatedAt: string;
}

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
