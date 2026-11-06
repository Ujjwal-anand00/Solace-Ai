import { Schema, model, Document, Types } from 'mongoose';
import { ScheduledReminder, NotificationType } from '@solace/shared';

export interface IReminderDocument extends Document {
  userId: Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  time: string; // "HH:mm"
  daysOfWeek: number[]; // 0-6
  deepLink?: string;
  relatedResourceId?: string;
  isEnabled: boolean;
  lastTriggeredAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  toDto(): ScheduledReminder;
}

const ReminderSchema = new Schema<IReminderDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    type: {
      type: String,
      enum: [
        'reminder',
        'daily_wellness',
        'mood_checkin',
        'checkin',
        'plan_task',
        'breathing',
        'streak_alert',
        'achievement',
        'weekly_summary',
        'affirmation',
        'system',
      ],
      default: 'reminder',
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Reminder title is required'],
      trim: true,
    },
    message: {
      type: String,
      required: [true, 'Reminder message is required'],
      trim: true,
    },
    time: {
      type: String,
      required: [true, 'Reminder time is required in HH:mm format'],
      match: /^([01]\d|2[0-3]):([0-5]\d)$/,
    },
    daysOfWeek: {
      type: [Number],
      default: [0, 1, 2, 3, 4, 5, 6],
    },
    deepLink: {
      type: String,
    },
    relatedResourceId: {
      type: String,
    },
    isEnabled: {
      type: Boolean,
      default: true,
      index: true,
    },
    lastTriggeredAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

ReminderSchema.index({ userId: 1, type: 1, time: 1 });

ReminderSchema.methods.toDto = function (): ScheduledReminder {
  const obj = this.toObject();
  return {
    id: obj._id.toString(),
    userId: obj.userId.toString(),
    type: obj.type,
    title: obj.title,
    message: obj.message,
    time: obj.time,
    daysOfWeek: obj.daysOfWeek || [0, 1, 2, 3, 4, 5, 6],
    deepLink: obj.deepLink,
    relatedResourceId: obj.relatedResourceId,
    isEnabled: obj.isEnabled,
    lastTriggeredAt: obj.lastTriggeredAt?.toISOString?.(),
    createdAt: obj.createdAt.toISOString(),
    updatedAt: obj.updatedAt.toISOString(),
  };
};

export const ReminderModel = model<IReminderDocument>('Reminder', ReminderSchema);

