import { Schema, model, Document } from 'mongoose';
import { Achievement } from '@solace/shared';

export interface IAchievementDocument extends Document {
  title: string;
  description: string;
  icon: string;
  category: string;
  criteria: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  toDto(): Achievement;
}

const AchievementSchema = new Schema<IAchievementDocument>(
  {
    title: {
      type: String,
      required: [true, 'Achievement title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Achievement description is required'],
      trim: true,
    },
    icon: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
      index: true,
    },
    criteria: {
      type: String,
      required: true,
      unique: true,
      trim: true,
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

AchievementSchema.methods.toDto = function (): Achievement {
  const obj = this.toObject();
  return {
    id: obj._id.toString(),
    title: obj.title,
    description: obj.description,
    icon: obj.icon,
    category: obj.category,
    criteria: obj.criteria,
    isActive: obj.isActive,
    createdAt: obj.createdAt.toISOString(),
    updatedAt: obj.updatedAt.toISOString(),
  };
};

export const AchievementModel = model<IAchievementDocument>('Achievement', AchievementSchema);
