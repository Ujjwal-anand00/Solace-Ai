import { Schema, model, Document } from 'mongoose';
import {
  ResourceContentType,
  ResourceDetail,
  ResourceContentBlock,
} from '@solace/shared';

export interface IResourceDocument extends Document {
  title: string;
  slug: string;
  description: string;
  category: string;
  contentType: ResourceContentType;
  contentUrl: string;
  language: string;
  author: string;
  readingMinutes: number;
  coverImage?: string;
  tags: string[];
  blocks: ResourceContentBlock[];
  relatedActivityIds: string[];
  isFeatured: boolean;
  isPublished: boolean;
  publishedAt: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  toDto(extra?: {
    isBookmarked?: boolean;
    progressPercent?: number;
    isCompleted?: boolean;
  }): ResourceDetail;
}

const ContentBlockSchema = new Schema(
  {
    type: {
      type: String,
      enum: ['heading', 'paragraph', 'bullet_list', 'numbered_list', 'callout', 'quote', 'step'],
      required: true,
    },
    text: { type: String, trim: true },
    items: [{ type: String, trim: true }],
    calloutType: {
      type: String,
      enum: ['tip', 'note', 'reflection', 'warning'],
      default: 'note',
    },
  },
  { _id: false },
);

const ResourceSchema = new Schema<IResourceDocument>(
  {
    title: {
      type: String,
      required: [true, 'Resource title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Resource description is required'],
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    category: {
      type: String,
      required: true,
      index: true,
      lowercase: true,
      trim: true,
    },
    contentType: {
      type: String,
      enum: ['article', 'audio', 'guide', 'helpline', 'exercise'],
      default: 'guide',
      index: true,
    },
    contentUrl: {
      type: String,
      default: '',
    },
    language: {
      type: String,
      enum: ['en', 'hi', 'pa'],
      default: 'en',
      index: true,
    },
    author: {
      type: String,
      default: 'Solace Wellness Team',
      trim: true,
    },
    readingMinutes: {
      type: Number,
      default: 4,
      min: 1,
    },
    coverImage: {
      type: String,
      default: '',
    },
    tags: {
      type: [String],
      default: [],
      index: true,
    },
    blocks: {
      type: [ContentBlockSchema],
      default: [],
    },
    relatedActivityIds: {
      type: [String],
      default: [],
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },
    isPublished: {
      type: Boolean,
      default: true,
      index: true,
    },
    publishedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

ResourceSchema.index({ category: 1, isPublished: 1, publishedAt: -1 });
ResourceSchema.index({ isFeatured: 1, isPublished: 1 });
ResourceSchema.index({ title: 'text', description: 'text', tags: 'text' });

ResourceSchema.methods.toDto = function (extra?: {
  isBookmarked?: boolean;
  progressPercent?: number;
  isCompleted?: boolean;
}): ResourceDetail {
  const obj = this.toObject();
  return {
    id: obj._id.toString(),
    title: obj.title,
    description: obj.description,
    category: obj.category,
    contentType: obj.contentType,
    contentUrl: obj.contentUrl || '',
    language: obj.language || 'en',
    author: obj.author || 'Solace Wellness Team',
    readingMinutes: obj.readingMinutes || 4,
    coverImage: obj.coverImage || '',
    tags: obj.tags || [],
    blocks: obj.blocks || [],
    relatedActivityIds: obj.relatedActivityIds || [],
    isFeatured: Boolean(obj.isFeatured),
    publishedAt: obj.publishedAt
      ? new Date(obj.publishedAt).toISOString()
      : new Date(obj.createdAt).toISOString(),
    isActive: Boolean(obj.isActive),
    isBookmarked: extra?.isBookmarked ?? false,
    progressPercent: extra?.progressPercent ?? 0,
    isCompleted: extra?.isCompleted ?? false,
    createdAt: obj.createdAt.toISOString(),
    updatedAt: obj.updatedAt.toISOString(),
  };
};

export const ResourceModel = model<IResourceDocument>('Resource', ResourceSchema);
