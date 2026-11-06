import { Schema, model, Document } from 'mongoose';
import { JournalPrompt, PromptCategory } from '@solace/shared';

export interface IJournalPromptDocument extends Document {
  promptId: string;
  category: PromptCategory;
  text: string;
  subtext?: string;
  tags: string[];
  isActive: boolean;
  order: number;
  toDto(): JournalPrompt;
}

const JournalPromptSchema = new Schema<IJournalPromptDocument>(
  {
    promptId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    category: {
      type: String,
      enum: ['gratitude', 'reflection', 'emotions', 'growth', 'calm', 'relationships'],
      required: true,
      index: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
    },
    subtext: {
      type: String,
      trim: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

JournalPromptSchema.methods.toDto = function (): JournalPrompt {
  const obj = this.toObject();
  return {
    id: obj.promptId || obj._id.toString(),
    category: obj.category,
    text: obj.text,
    subtext: obj.subtext,
    tags: obj.tags || [],
  };
};

export const JournalPromptModel = model<IJournalPromptDocument>(
  'JournalPrompt',
  JournalPromptSchema,
);

