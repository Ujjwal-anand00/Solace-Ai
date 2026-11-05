import { Schema, model, Document, Types } from 'mongoose';
import { Conversation, ConversationStatus } from '@solace/shared';

export interface IConversationDocument extends Document {
  userId: Types.ObjectId;
  title: string;
  status: ConversationStatus;
  lastMessageAt: Date;
  createdAt: Date;
  updatedAt: Date;
  toDto(): Conversation;
}

const ConversationSchema = new Schema<IConversationDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    title: {
      type: String,
      default: 'New Conversation',
      trim: true,
      maxlength: [120, 'Conversation title cannot exceed 120 characters'],
    },
    status: {
      type: String,
      enum: ['active', 'archived', 'closed'],
      default: 'active',
      index: true,
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

ConversationSchema.index({ userId: 1, lastMessageAt: -1 });

ConversationSchema.methods.toDto = function (): Conversation {
  const obj = this.toObject();
  return {
    id: obj._id.toString(),
    userId: obj.userId.toString(),
    title: obj.title,
    status: obj.status,
    lastMessageAt: obj.lastMessageAt.toISOString(),
    createdAt: obj.createdAt.toISOString(),
    updatedAt: obj.updatedAt.toISOString(),
  };
};

export const ConversationModel = model<IConversationDocument>('Conversation', ConversationSchema);
