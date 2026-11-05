import { Schema, model, Document, Types } from 'mongoose';
import { UserProgress } from '@solace/shared';

export interface IUserProgressDocument extends Document {
  userId: Types.ObjectId;
  currentStreak: number;
  longestStreak: number;
  totalActivities: number;
  totalMoodCheckIns: number;
  totalJournalEntries: number;
  totalBreathingSessions: number;
  totalPlanTasksCompleted: number;
  totalAssessmentsCompleted: number;
  activeDates: string[]; // YYYY-MM-DD
  earnedAchievements: string[];
  lastActivityDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  toDto(): UserProgress;
}

const UserProgressSchema = new Schema<IUserProgressDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      unique: true,
      index: true,
    },
    currentStreak: {
      type: Number,
      default: 0,
      min: 0,
    },
    longestStreak: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalActivities: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalMoodCheckIns: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalJournalEntries: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalBreathingSessions: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalPlanTasksCompleted: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalAssessmentsCompleted: {
      type: Number,
      default: 0,
      min: 0,
    },
    activeDates: {
      type: [String],
      default: [],
    },
    earnedAchievements: {
      type: [String],
      default: [],
    },
    lastActivityDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

UserProgressSchema.methods.toDto = function (): UserProgress {
  const obj = this.toObject();
  return {
    userId: obj.userId.toString(),
    currentStreak: obj.currentStreak || 0,
    longestStreak: obj.longestStreak || 0,
    totalActivities: obj.totalActivities || 0,
    totalMoodCheckIns: obj.totalMoodCheckIns || 0,
    totalJournalEntries: obj.totalJournalEntries || 0,
    totalBreathingSessions: obj.totalBreathingSessions || 0,
    totalPlanTasksCompleted: obj.totalPlanTasksCompleted || 0,
    totalAssessmentsCompleted: obj.totalAssessmentsCompleted || 0,
    activeDaysCount: (obj.activeDates || []).length,
    earnedAchievements: obj.earnedAchievements || [],
    lastActivityDate: obj.lastActivityDate?.toISOString?.(),
    createdAt: obj.createdAt.toISOString(),
    updatedAt: obj.updatedAt.toISOString(),
  };
};

export const ProgressModel = model<IUserProgressDocument>('UserProgress', UserProgressSchema);
