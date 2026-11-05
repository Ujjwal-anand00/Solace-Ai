import { Schema, model, Document } from 'mongoose';
import { Affirmation } from '@solace/shared';

export interface IAffirmationDocument extends Document {
  text: string;
  slug: string;
  category: string;
  tags: string[];
  language: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  toDto(): Affirmation;
}

const AffirmationSchema = new Schema<IAffirmationDocument>(
  {
    text: {
      type: String,
      required: [true, 'Affirmation text is required'],
      trim: true,
      maxlength: [300, 'Text cannot exceed 300 characters'],
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      index: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    language: {
      type: String,
      default: 'en',
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

AffirmationSchema.index({ category: 1, isActive: 1 });

AffirmationSchema.methods.toDto = function (): Affirmation {
  const obj = this.toObject();
  return {
    id: obj._id.toString(),
    text: obj.text,
    category: obj.category,
    tags: obj.tags || [],
    language: obj.language,
    isActive: obj.isActive,
    createdAt: obj.createdAt.toISOString(),
    updatedAt: obj.updatedAt.toISOString(),
  };
};

export const AffirmationModel = model<IAffirmationDocument>('Affirmation', AffirmationSchema);
