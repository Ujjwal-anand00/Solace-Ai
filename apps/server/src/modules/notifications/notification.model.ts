import { Schema, model, Document, Types } from 'mongoose';
import { SolaceNotification, NotificationType, NotificationStatus } from '@solace/shared';

export interface INotificationDocument extends Document {
  userId: Types.ObjectId;
  title: string;
  message: string;
  type: NotificationType;
  scheduledAt?: Date;
  sentAt?: Date;
  status: NotificationStatus;
  relatedResourceId?: string;
  deepLink?: string;
  metadata?: Record<string, unknown>;
  deliveryAttempts: number;
  lastDeliveryError?: string;
  claimedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  toDto(): SolaceNotification;
}

const NotificationSchema = new Schema<INotificationDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Notification title is required'],
      trim: true,
    },
    message: {
      type: String,
      required: [true, 'Notification message is required'],
      trim: true,
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
    scheduledAt: {
      type: Date,
      index: true,
    },
    sentAt: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['pending', 'sent', 'read', 'failed', 'cancelled'],
      default: 'pending',
      index: true,
    },
    relatedResourceId: {
      type: String,
    },
    deepLink: {
      type: String,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
    deliveryAttempts: {
      type: Number,
      default: 0,
    },
    lastDeliveryError: {
      type: String,
    },
    claimedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

NotificationSchema.index({ userId: 1, scheduledAt: 1, status: 1 });
NotificationSchema.index({ status: 1, scheduledAt: 1, claimedAt: 1 });

NotificationSchema.methods.toDto = function (): SolaceNotification {
  const obj = this.toObject();
  return {
    id: obj._id.toString(),
    userId: obj.userId.toString(),
    title: obj.title,
    message: obj.message,
    type: obj.type,
    scheduledAt: obj.scheduledAt?.toISOString?.(),
    sentAt: obj.sentAt?.toISOString?.(),
    status: obj.status,
    relatedResourceId: obj.relatedResourceId,
    deepLink: obj.deepLink,
    metadata: obj.metadata,
    createdAt: obj.createdAt.toISOString(),
    updatedAt: obj.updatedAt.toISOString(),
  };
};

export const NotificationModel = model<INotificationDocument>('Notification', NotificationSchema);
