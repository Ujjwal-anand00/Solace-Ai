import { Schema, model, Document, Types } from 'mongoose';
import { NotificationPreferences } from '@solace/shared';

export interface INotificationPreferencesDocument extends Document {
  userId: Types.ObjectId;
  masterEnabled: boolean;
  dailyWellness: {
    enabled: boolean;
    time: string;
    days: number[];
  };
  moodCheckin: {
    enabled: boolean;
    time: string;
  };
  planReminders: {
    enabled: boolean;
    time?: string;
  };
  breathingReminders: {
    enabled: boolean;
    time?: string;
    preferredActivityId?: string;
  };
  milestones: {
    enabled: boolean;
  };
  weeklySummary: {
    enabled: boolean;
    dayOfWeek: number;
    time: string;
  };
  quietHours: {
    enabled: boolean;
    startTime: string;
    endTime: string;
  };
  timezone: string;
  createdAt: Date;
  updatedAt: Date;
  toDto(): NotificationPreferences;
}

const NotificationPreferencesSchema = new Schema<INotificationPreferencesDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    masterEnabled: {
      type: Boolean,
      default: true,
    },
    dailyWellness: {
      enabled: { type: Boolean, default: true },
      time: { type: String, default: '09:00' },
      days: { type: [Number], default: [0, 1, 2, 3, 4, 5, 6] },
    },
    moodCheckin: {
      enabled: { type: Boolean, default: true },
      time: { type: String, default: '20:00' },
    },
    planReminders: {
      enabled: { type: Boolean, default: true },
      time: { type: String, default: '10:00' },
    },
    breathingReminders: {
      enabled: { type: Boolean, default: true },
      time: { type: String, default: '14:00' },
      preferredActivityId: { type: String },
    },
    milestones: {
      enabled: { type: Boolean, default: true },
    },
    weeklySummary: {
      enabled: { type: Boolean, default: true },
      dayOfWeek: { type: Number, default: 0 },
      time: { type: String, default: '18:00' },
    },
    quietHours: {
      enabled: { type: Boolean, default: true },
      startTime: { type: String, default: '22:00' },
      endTime: { type: String, default: '08:00' },
    },
    timezone: {
      type: String,
      default: 'UTC',
    },
  },
  {
    timestamps: true,
  },
);

NotificationPreferencesSchema.methods.toDto = function (): NotificationPreferences {
  const obj = this.toObject();
  return {
    userId: obj.userId.toString(),
    masterEnabled: obj.masterEnabled,
    dailyWellness: {
      enabled: obj.dailyWellness?.enabled ?? true,
      time: obj.dailyWellness?.time || '09:00',
      days: obj.dailyWellness?.days || [0, 1, 2, 3, 4, 5, 6],
    },
    moodCheckin: {
      enabled: obj.moodCheckin?.enabled ?? true,
      time: obj.moodCheckin?.time || '20:00',
    },
    planReminders: {
      enabled: obj.planReminders?.enabled ?? true,
      time: obj.planReminders?.time,
    },
    breathingReminders: {
      enabled: obj.breathingReminders?.enabled ?? true,
      time: obj.breathingReminders?.time,
      preferredActivityId: obj.breathingReminders?.preferredActivityId,
    },
    milestones: {
      enabled: obj.milestones?.enabled ?? true,
    },
    weeklySummary: {
      enabled: obj.weeklySummary?.enabled ?? true,
      dayOfWeek: obj.weeklySummary?.dayOfWeek ?? 0,
      time: obj.weeklySummary?.time || '18:00',
    },
    quietHours: {
      enabled: obj.quietHours?.enabled ?? true,
      startTime: obj.quietHours?.startTime || '22:00',
      endTime: obj.quietHours?.endTime || '08:00',
    },
    timezone: obj.timezone || 'UTC',
    updatedAt: obj.updatedAt.toISOString(),
  };
};

export const NotificationPreferencesModel = model<INotificationPreferencesDocument>(
  'NotificationPreferences',
  NotificationPreferencesSchema,
);

