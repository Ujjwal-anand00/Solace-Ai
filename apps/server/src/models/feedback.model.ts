import { Schema, model, Document, Types } from 'mongoose';

export interface IFeedbackDocument extends Document {
  userId: Types.ObjectId;
  category: 'bug' | 'feature' | 'content' | 'general';
  message: string;
  rating?: number;
  createdAt: Date;
  updatedAt: Date;
}

const FeedbackSchema = new Schema<IFeedbackDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    category: {
      type: String,
      enum: ['bug', 'feature', 'content', 'general'],
      default: 'general',
    },
    message: {
      type: String,
      required: true,
      maxlength: 2000,
      trim: true,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
  },
  {
    timestamps: true,
  },
);

export const FeedbackModel = model<IFeedbackDocument>('Feedback', FeedbackSchema);

