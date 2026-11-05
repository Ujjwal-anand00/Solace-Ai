import { Schema, model, Document } from 'mongoose';
import { WellnessActivity, ActivityDifficulty } from '@solace/shared';

export interface IActivityDocument extends Document {
  title: string;
  slug: string;
  description: string;
  category: string;
  duration: number;
  difficulty: ActivityDifficulty;
  instructions: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  toDto(): WellnessActivity;
}

const ActivitySchema = new Schema<IActivityDocument>(
  {
    title: {
      type: String,
      required: [true, 'Activity title is required'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters'],
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
      required: [true, 'Activity description is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Activity category is required'],
      index: true,
      trim: true,
    },
    duration: {
      type: Number,
      required: [true, 'Duration in seconds is required'],
      min: [10, 'Duration must be at least 10 seconds'],
    },
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner',
    },
    instructions: {
      type: [String],
      default: [],
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

ActivitySchema.index({ category: 1, isActive: 1 });

ActivitySchema.methods.toDto = function (): WellnessActivity {
  const obj = this.toObject();
  return {
    id: obj._id.toString(),
    slug: obj.slug,
    title: obj.title,
    description: obj.description,
    category: obj.category,
    duration: obj.duration,
    difficulty: obj.difficulty,
    instructions: obj.instructions || [],
    isActive: obj.isActive,
    createdAt: obj.createdAt.toISOString(),
    updatedAt: obj.updatedAt.toISOString(),
  };
};

export const Activity = model<IActivityDocument>('Activity', ActivitySchema);
