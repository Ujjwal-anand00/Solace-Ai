import { Schema, model, Document, Types } from 'mongoose';
import { JournalEntry } from '@solace/shared';

export interface IJournalDocument extends Document {
  userId: Types.ObjectId;
  title: string;
  content: string;
  prompt?: string;
  moodAssociation?: string;
  tags: string[];
  isFavorite: boolean;
  createdAt: Date;
  updatedAt: Date;
  toDto(): JournalEntry;
}

const JournalSchema = new Schema<IJournalDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Journal title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    content: {
      type: String,
      required: [true, 'Journal content is required'],
      trim: true,
    },
    prompt: {
      type: String,
      trim: true,
      maxlength: [300, 'Prompt cannot exceed 300 characters'],
    },
    moodAssociation: {
      type: String,
      trim: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    isFavorite: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

// Indexes
JournalSchema.index({ userId: 1, createdAt: -1 });
JournalSchema.index({ userId: 1, isFavorite: 1 });
JournalSchema.index({ title: 'text', content: 'text' });

JournalSchema.methods.toDto = function (): JournalEntry {
  const obj = this.toObject();
  return {
    id: obj._id.toString(),
    userId: obj.userId.toString(),
    title: obj.title,
    content: obj.content,
    prompt: obj.prompt,
    moodAssociation: obj.moodAssociation,
    tags: obj.tags || [],
    isFavorite: obj.isFavorite,
    createdAt: obj.createdAt.toISOString(),
    updatedAt: obj.updatedAt.toISOString(),
  };
};

export const Journal = model<IJournalDocument>('Journal', JournalSchema);
