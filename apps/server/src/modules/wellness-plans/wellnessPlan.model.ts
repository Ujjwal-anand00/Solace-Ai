import { Schema, model, Document, Types } from 'mongoose';
import { WellnessPlan, PlanStatus } from '@solace/shared';

export interface IWellnessPlanDocument extends Document {
  userId: Types.ObjectId;
  title: string;
  description: string;
  goals: string[];
  dailyTasks: Array<{
    id: string;
    title: string;
    category: string;
    durationMinutes: number;
    completed: boolean;
  }>;
  startDate: Date;
  endDate: Date;
  status: PlanStatus;
  progress: number;
  createdAt: Date;
  updatedAt: Date;
  toDto(): WellnessPlan;
}

const WellnessPlanSchema = new Schema<IWellnessPlanDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Plan title is required'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },
    description: {
      type: String,
      required: [true, 'Plan description is required'],
      trim: true,
    },
    goals: {
      type: [String],
      default: [],
    },
    dailyTasks: [
      {
        id: { type: String, required: true },
        title: { type: String, required: true },
        category: { type: String, required: true },
        durationMinutes: { type: Number, default: 5 },
        completed: { type: Boolean, default: false },
      },
    ],
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'paused', 'abandoned'],
      default: 'active',
      index: true,
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
  },
  {
    timestamps: true,
  },
);

WellnessPlanSchema.index({ userId: 1, status: 1 });

WellnessPlanSchema.methods.toDto = function (): WellnessPlan {
  const obj = this.toObject();
  return {
    id: obj._id.toString(),
    userId: obj.userId.toString(),
    title: obj.title,
    description: obj.description,
    goals: obj.goals || [],
    dailyTasks: obj.dailyTasks || [],
    startDate: obj.startDate.toISOString(),
    endDate: obj.endDate.toISOString(),
    status: obj.status,
    progress: obj.progress,
    createdAt: obj.createdAt.toISOString(),
    updatedAt: obj.updatedAt.toISOString(),
  };
};

export const WellnessPlanModel = model<IWellnessPlanDocument>('WellnessPlan', WellnessPlanSchema);
