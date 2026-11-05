import { Schema, model, Document, Types } from 'mongoose';
import { CompanionSettings } from '@solace/shared';

export interface ICompanionSettingsDocument extends Document {
  userId: Types.ObjectId;
  enablePersonalization: boolean;
  journalPersonalizationConsent: boolean;
  preferredTone: 'gentle' | 'balanced' | 'direct';
  createdAt: Date;
  updatedAt: Date;
  toDto(): CompanionSettings;
}

const CompanionSettingsSchema = new Schema<ICompanionSettingsDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      unique: true,
      index: true,
    },
    enablePersonalization: {
      type: Boolean,
      default: true,
    },
    journalPersonalizationConsent: {
      type: Boolean,
      default: false,
    },
    preferredTone: {
      type: String,
      enum: ['gentle', 'balanced', 'direct'],
      default: 'balanced',
    },
  },
  {
    timestamps: true,
  },
);

CompanionSettingsSchema.methods.toDto = function (): CompanionSettings {
  const obj = this.toObject();
  return {
    userId: obj.userId.toString(),
    enablePersonalization: obj.enablePersonalization ?? true,
    journalPersonalizationConsent: obj.journalPersonalizationConsent ?? false,
    preferredTone: obj.preferredTone || 'balanced',
    createdAt: obj.createdAt ? obj.createdAt.toISOString() : new Date().toISOString(),
    updatedAt: obj.updatedAt ? obj.updatedAt.toISOString() : new Date().toISOString(),
  };
};

export const CompanionSettingsModel = model<ICompanionSettingsDocument>(
  'CompanionSettings',
  CompanionSettingsSchema,
);

