import { Schema, model, Document, Types } from 'mongoose';
import { ChatMessage, MessageRole } from '@solace/shared';

export interface IChatMessageDocument extends Document {
  conversationId: Types.ObjectId;
  userId: Types.ObjectId;
  role: MessageRole;
  content: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
  toDto(): ChatMessage;
}

const ChatMessageSchema = new Schema<IChatMessageDocument>(
  {
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: 'Conversation',
      required: [true, 'Conversation ID is required'],
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    role: {
      type: String,
      enum: ['user', 'assistant', 'system'],
      required: [true, 'Role is required'],
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
      trim: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  },
);

ChatMessageSchema.index({ conversationId: 1, createdAt: 1 });
ChatMessageSchema.index({ userId: 1, createdAt: -1 });

ChatMessageSchema.methods.toDto = function (): ChatMessage {
  const obj = this.toObject();
  return {
    id: obj._id.toString(),
    conversationId: obj.conversationId.toString(),
    userId: obj.userId.toString(),
    role: obj.role,
    content: obj.content,
    metadata: obj.metadata,
    createdAt: obj.createdAt.toISOString(),
    updatedAt: obj.updatedAt.toISOString(),
  };
};

export const ChatMessageModel = model<IChatMessageDocument>('ChatMessage', ChatMessageSchema);
