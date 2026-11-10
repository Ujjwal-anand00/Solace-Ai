import { ResourceContentType, WellnessResource } from './extra';

export type EducationalCategory =
  | 'emotions'
  | 'stress'
  | 'mindfulness'
  | 'sleep'
  | 'self_care'
  | 'confidence'
  | 'habits'
  | 'growth';

export interface ResourceCategoryMeta {
  id: EducationalCategory;
  title: string;
  description: string;
  icon: string;
  count?: number;
}

export interface ResourceContentBlock {
  type: 'heading' | 'paragraph' | 'bullet_list' | 'numbered_list' | 'callout' | 'quote' | 'step';
  text?: string;
  items?: string[];
  calloutType?: 'tip' | 'note' | 'reflection' | 'warning';
}

export interface ResourceDetail extends WellnessResource {
  author?: string;
  readingMinutes: number;
  publishedAt: string;
  isFeatured: boolean;
  coverImage?: string;
  tags: string[];
  blocks: ResourceContentBlock[];
  relatedActivityIds?: string[];
  isBookmarked?: boolean;
  progressPercent?: number;
  isCompleted?: boolean;
}

export interface ResourceProgressItem {
  id: string;
  resourceId: string;
  userId: string;
  progressPercent: number;
  isCompleted: boolean;
  completedAt?: string;
  lastReadAt: string;
}

export interface ResourceFilterParams {
  category?: string;
  search?: string;
  tag?: string;
  language?: string;
  contentType?: ResourceContentType;
  page?: number;
  limit?: number;
}

export interface CreateResourceAdminDto {
  title: string;
  slug?: string;
  description: string;
  category: string;
  contentType?: ResourceContentType;
  contentUrl?: string;
  language?: string;
  author?: string;
  readingMinutes?: number;
  coverImage?: string;
  tags?: string[];
  blocks?: ResourceContentBlock[];
  relatedActivityIds?: string[];
  isFeatured?: boolean;
  isPublished?: boolean;
}

export interface UpdateResourceAdminDto extends Partial<CreateResourceAdminDto> {}

