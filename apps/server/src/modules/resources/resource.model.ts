import { Schema, model, Document } from 'mongoose';
import { WellnessResource, ResourceContentType } from '@solace/shared';

export interface IResourceDocument extends Document {
  title: string;
  slug: string;
  description: string;
  category: string;
  contentType: ResourceContentType;
  contentUrl: string;
  language: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  toDto(): WellnessResource;
}

const ResourceSchema = new Schema<IResourceDocument>(
  {
    title: {
      type: String,
      required: [true, 'Resource title is required'],
      trim: true,
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
    },
    category: {
      type: String,
      required: true,
      index: true,
    },
    contentType: {
      type: String,
      enum: ['article', 'audio', 'guide', 'helpline', 'exercise'],
      default: 'guide',
    },
    contentUrl: {
      type: String,
      default: '',
    },
    language: {
      type: String,
      default: 'en',
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

ResourceSchema.index({ category: 1, isActive: 1 });

ResourceSchema.methods.toDto = function (): WellnessResource {
  const obj = this.toObject();
  return {
    id: obj._id.toString(),
    title: obj.title,
    description: obj.description,
    category: obj.category,
    contentType: obj.contentType,
    contentUrl: obj.contentUrl,
    language: obj.language,
    isActive: obj.isActive,
    createdAt: obj.createdAt.toISOString(),
    updatedAt: obj.updatedAt.toISOString(),
  };
};

export const ResourceModel = model<IResourceDocument>('Resource', ResourceSchema);
