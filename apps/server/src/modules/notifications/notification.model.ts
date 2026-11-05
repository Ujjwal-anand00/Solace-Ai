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
      enum: ['reminder', 'affirmation', 'streak_alert', 'checkin', 'system'],
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
  },
  {
    timestamps: true,
  },
);

NotificationSchema.index({ userId: 1, scheduledAt: 1, status: 1 });

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
    createdAt: obj.createdAt.toISOString(),
    updatedAt: obj.updatedAt.toISOString(),
  };
};

export const NotificationModel = model<INotificationDocument>('Notification', NotificationSchema);
