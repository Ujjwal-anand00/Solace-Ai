import { Schema, model, Document, Types } from 'mongoose';
import { JournalEntry, JournalCategory, JournalAiInsight } from '@solace/shared';

export interface IJournalDocument extends Document {
  userId: Types.ObjectId;
  title: string;
  content: string;
  category: JournalCategory;
  prompt?: string;
  promptId?: string;
  moodAssociation?: string;
  moodIntensity?: number;
  emotions: string[];
  gratitudeItems: string[];
  tags: string[];
  isFavorite: boolean;
  isDraft: boolean;
  aiConsentGranted: boolean;
  aiInsight?: {
    theme: string;
    reflection: string;
    suggestedAction?: string;
    affirmingThought?: string;
    sentimentTone?: 'uplifting' | 'gentle' | 'neutral' | 'introspective';
    createdAt: Date;
  };
  createdAt: Date;
  updatedAt: Date;
  toDto(): JournalEntry;
}

const JournalAiInsightSchema = new Schema(
  {
    theme: { type: String, required: true },
    reflection: { type: String, required: true },
    suggestedAction: { type: String },
    affirmingThought: { type: String },
    sentimentTone: {
      type: String,
      enum: ['uplifting', 'gentle', 'neutral', 'introspective'],
      default: 'gentle',
    },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const JournalSchema = new Schema<IJournalDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Journal title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    content: {
      type: String,
      required: [true, 'Journal content is required'],
      trim: true,
    },
    category: {
      type: String,
      enum: [
        'free_write',
        'guided_reflection',
        'gratitude',
        'emotional_checkin',
        'mindful_observation',
        'self_discovery',
        'stress_release',
      ],
      default: 'free_write',
      index: true,
    },
    prompt: {
      type: String,
      trim: true,
      maxlength: [300, 'Prompt cannot exceed 300 characters'],
    },
    promptId: {
      type: String,
      trim: true,
    },
    moodAssociation: {
      type: String,
      trim: true,
    },
    moodIntensity: {
      type: Number,
      min: 1,
      max: 10,
    },
    emotions: {
      type: [String],
      default: [],
    },
    gratitudeItems: {
      type: [String],
      default: [],
    },
    tags: {
      type: [String],
      default: [],
    },
    isFavorite: {
      type: Boolean,
      default: false,
      index: true,
    },
    isDraft: {
      type: Boolean,
      default: false,
      index: true,
    },
    aiConsentGranted: {
      type: Boolean,
      default: false,
    },
    aiInsight: {
      type: JournalAiInsightSchema,
      required: false,
    },
  },
  {
    timestamps: true,
  },
);

// Indexes
JournalSchema.index({ userId: 1, createdAt: -1 });
JournalSchema.index({ userId: 1, isFavorite: 1 });
JournalSchema.index({ userId: 1, isDraft: 1 });
JournalSchema.index({ userId: 1, category: 1 });
JournalSchema.index({ title: 'text', content: 'text' });

JournalSchema.methods.toDto = function (): JournalEntry {
  const obj = this.toObject();
  let aiInsightDto: JournalAiInsight | undefined = undefined;
  if (obj.aiInsight) {
    aiInsightDto = {
      theme: obj.aiInsight.theme,
      reflection: obj.aiInsight.reflection,
      suggestedAction: obj.aiInsight.suggestedAction,
      affirmingThought: obj.aiInsight.affirmingThought,
      sentimentTone: obj.aiInsight.sentimentTone,
      createdAt: obj.aiInsight.createdAt ? new Date(obj.aiInsight.createdAt).toISOString() : new Date().toISOString(),
    };
  }

  return {
    id: obj._id.toString(),
    userId: obj.userId.toString(),
    title: obj.title,
    content: obj.content,
    category: obj.category || 'free_write',
    prompt: obj.prompt,
    promptId: obj.promptId,
    moodAssociation: obj.moodAssociation,
    moodIntensity: obj.moodIntensity,
    emotions: obj.emotions || [],
    gratitudeItems: obj.gratitudeItems || [],
    tags: obj.tags || [],
    isFavorite: Boolean(obj.isFavorite),
    isDraft: Boolean(obj.isDraft),
    aiConsentGranted: Boolean(obj.aiConsentGranted),
    aiInsight: aiInsightDto,
    createdAt: obj.createdAt.toISOString(),
    updatedAt: obj.updatedAt.toISOString(),
  };
};

export const Journal = model<IJournalDocument>('Journal', JournalSchema);
