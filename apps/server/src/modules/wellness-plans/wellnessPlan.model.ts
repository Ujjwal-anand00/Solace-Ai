import { Schema, model, Document, Types } from 'mongoose';
import { WellnessPlan, PlanStatus, DailyPlanTask } from '@solace/shared';

export interface IWellnessPlanDocument extends Document {
  userId: Types.ObjectId;
  title: string;
  description: string;
  durationDays: number;
  focusAreas: string[];
  goals: string[];
  dailyTasks: Array<{
    id: string;
    day: number;
    title: string;
    description: string;
    category: string;
    durationMinutes: number;
    completed: boolean;
    completedAt?: Date;
    skipped?: boolean;
  }>;
  startDate: Date;
  endDate: Date;
  status: PlanStatus;
  progress: number;
  isAiGenerated: boolean;
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
    durationDays: {
      type: Number,
      required: true,
      default: 7,
    },
    focusAreas: {
      type: [String],
      default: [],
    },
    goals: {
      type: [String],
      default: [],
    },
    dailyTasks: [
      {
        id: { type: String, required: true },
        day: { type: Number, required: true, default: 1 },
        title: { type: String, required: true },
        description: { type: String, default: '' },
        category: { type: String, required: true },
        durationMinutes: { type: Number, default: 5 },
        completed: { type: Boolean, default: false },
        completedAt: { type: Date },
        skipped: { type: Boolean, default: false },
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
    isAiGenerated: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

WellnessPlanSchema.index({ userId: 1, status: 1, createdAt: -1 });

WellnessPlanSchema.methods.toDto = function (): WellnessPlan {
  const obj = this.toObject();
  return {
    id: obj._id.toString(),
    userId: obj.userId.toString(),
    title: obj.title,
    description: obj.description,
    durationDays: obj.durationDays || 7,
    focusAreas: obj.focusAreas || [],
    goals: obj.goals || [],
    dailyTasks: (obj.dailyTasks || []).map(
      (t: {
        id: string;
        day?: number;
        title: string;
        description?: string;
        category: string;
        durationMinutes?: number;
        completed?: boolean;
        completedAt?: Date;
        skipped?: boolean;
      }): DailyPlanTask => ({
        id: t.id,
        day: t.day || 1,
        title: t.title,
        description: t.description || '',
        category: t.category,
        durationMinutes: t.durationMinutes || 5,
        completed: Boolean(t.completed),
        completedAt: t.completedAt ? new Date(t.completedAt).toISOString() : undefined,
        skipped: Boolean(t.skipped),
      }),
    ),
    startDate: obj.startDate.toISOString(),
    endDate: obj.endDate.toISOString(),
    status: obj.status,
    progress: obj.progress || 0,
    isAiGenerated: obj.isAiGenerated ?? true,
    createdAt: obj.createdAt.toISOString(),
    updatedAt: obj.updatedAt.toISOString(),
  };
};

export const WellnessPlanModel = model<IWellnessPlanDocument>('WellnessPlan', WellnessPlanSchema);
