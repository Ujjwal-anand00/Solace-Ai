import { Schema, model, Document, Types } from 'mongoose';

export interface IResourceBookmarkDocument extends Document {
  userId: Types.ObjectId;
  resourceId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ResourceBookmarkSchema = new Schema<IResourceBookmarkDocument>(
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
  },
  {
    timestamps: true,
  },
);

// Prevent duplicate bookmarks per user
ResourceBookmarkSchema.index({ userId: 1, resourceId: 1 }, { unique: true });

export const ResourceBookmarkModel = model<IResourceBookmarkDocument>(
  'ResourceBookmark',
  ResourceBookmarkSchema,
);

