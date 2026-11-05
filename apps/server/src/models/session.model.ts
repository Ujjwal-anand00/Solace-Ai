import { Schema, model, Document, Types } from 'mongoose';

export interface ISessionDocument extends Document {
  userId: Types.ObjectId;
  refreshTokenHash: string;
  userAgent?: string;
  ipAddress?: string;
  expiresAt: Date;
  isRevoked: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SessionSchema = new Schema<ISessionDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    refreshTokenHash: {
      type: String,
      required: true,
      index: true,
    },
    userAgent: {
      type: String,
      default: '',
    },
    ipAddress: {
      type: String,
      default: '',
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    isRevoked: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

// TTL index to automatically purge sessions after expiration
SessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const Session = model<ISessionDocument>('Session', SessionSchema);
