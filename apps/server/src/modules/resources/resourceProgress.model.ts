import { Schema, model, Document, Types } from 'mongoose';
import { ResourceProgressItem } from '@solace/shared';

export interface IResourceProgressDocument extends Document {
  userId: Types.ObjectId;
  resourceId: Types.ObjectId;
  progressPercent: number;
  isCompleted: boolean;
  completedAt?: Date;
  lastReadAt: Date;
  createdAt: Date;
  updatedAt: Date;
  toDto(): ResourceProgressItem;
}

const ResourceProgressSchema = new Schema<IResourceProgressDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    resourceId: {
      type: Schema.Types.ObjectId,
      ref: 'Resource',
      required: true,
      index: true,
    },
    progressPercent: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    isCompleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    completedAt: {
      type: Date,
    },
    lastReadAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

ResourceProgressSchema.index({ userId: 1, resourceId: 1 }, { unique: true });

ResourceProgressSchema.methods.toDto = function (): ResourceProgressItem {
  const obj = this.toObject();
  return {
    id: obj._id.toString(),
    resourceId: obj.resourceId.toString(),
    userId: obj.userId.toString(),
    progressPercent: obj.progressPercent || 0,
    isCompleted: Boolean(obj.isCompleted),
    completedAt: obj.completedAt ? new Date(obj.completedAt).toISOString() : undefined,
    lastReadAt: obj.lastReadAt ? new Date(obj.lastReadAt).toISOString() : new Date().toISOString(),
  };
};

export const ResourceProgressModel = model<IResourceProgressDocument>(
  'ResourceProgress',
  ResourceProgressSchema,
);

