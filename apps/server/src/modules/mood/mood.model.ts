import { Schema, model, Document, Types } from 'mongoose';
import { MoodEntry } from '@solace/shared';

export interface IMoodDocument extends Document {
  userId: Types.ObjectId;
  mood: string;
  moodIntensity: number;
  emotions: string[];
  note?: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  toDto(): MoodEntry;
}

const MoodSchema = new Schema<IMoodDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    mood: {
      type: String,
      required: [true, 'Mood is required'],
      trim: true,
      lowercase: true,
    },
    moodIntensity: {
      type: Number,
      required: [true, 'Mood intensity is required'],
      min: [1, 'Mood intensity must be between 1 and 10'],
      max: [10, 'Mood intensity must be between 1 and 10'],
    },
    emotions: {
      type: [String],
      default: [],
    },
    note: {
      type: String,
      trim: true,
      maxlength: [1000, 'Note cannot exceed 1000 characters'],
    },
    tags: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

// Compound index for user query performance
MoodSchema.index({ userId: 1, createdAt: -1 });
MoodSchema.index({ userId: 1, mood: 1 });

MoodSchema.methods.toDto = function (): MoodEntry {
  const obj = this.toObject();
  return {
    id: obj._id.toString(),
    userId: obj.userId.toString(),
    mood: obj.mood,
    moodIntensity: obj.moodIntensity,
    emotions: obj.emotions || [],
    note: obj.note,
    tags: obj.tags || [],
    createdAt: obj.createdAt.toISOString(),
    updatedAt: obj.updatedAt.toISOString(),
  };
};

export const Mood = model<IMoodDocument>('Mood', MoodSchema);
