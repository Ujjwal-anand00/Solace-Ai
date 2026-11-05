import { Schema, model, Document } from 'mongoose';
import { UserProfile, UserNotificationPreferences } from '@solace/shared';

export interface IUserDocument extends Document {
  name: string;
  preferredName?: string;
  email: string;
  passwordHash: string;
  avatarUrl?: string;
  dateOfBirth?: Date;
  wellnessGoals: string[];
  onboardingCompleted: boolean;
  isEmailVerified: boolean;
  isActive: boolean;
  notificationPreferences: UserNotificationPreferences;
  themePreference: 'light' | 'dark' | 'system';
  passwordResetTokenHash?: string;
  passwordResetExpires?: Date;
  emailVerificationTokenHash?: string;
  emailVerificationExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
  toProfileJSON(): UserProfile;
}

const UserSchema = new Schema<IUserDocument>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [80, 'Name cannot exceed 80 characters'],
    },
    preferredName: {
      type: String,
      trim: true,
      maxlength: [50, 'Preferred name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    passwordHash: {
      type: String,
      required: [true, 'Password hash is required'],
      select: false,
    },
    avatarUrl: {
      type: String,
      default: '',
    },
    dateOfBirth: {
      type: Date,
      default: null,
    },
    wellnessGoals: {
      type: [String],
      default: [],
    },
    onboardingCompleted: {
      type: Boolean,
      default: false,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    notificationPreferences: {
      dailyCheckIn: { type: Boolean, default: true },
      mindfulBreaths: { type: Boolean, default: true },
      affirmations: { type: Boolean, default: true },
    },
    themePreference: {
      type: String,
      enum: ['light', 'dark', 'system'],
      default: 'system',
    },
    passwordResetTokenHash: {
      type: String,
      select: false,
    },
    passwordResetExpires: {
      type: Date,
      select: false,
    },
    emailVerificationTokenHash: {
      type: String,
      select: false,
    },
    emailVerificationExpires: {
      type: Date,
      select: false,
    },
  },
  {
    timestamps: true,
  },
);

UserSchema.methods.toProfileJSON = function (): UserProfile {
  return {
    id: this._id.toString(),
    name: this.name,
    preferredName: this.preferredName,
    email: this.email,
    avatarUrl: this.avatarUrl,
    dateOfBirth: this.dateOfBirth ? this.dateOfBirth.toISOString() : undefined,
    wellnessGoals: this.wellnessGoals || [],
    onboardingCompleted: this.onboardingCompleted,
    isEmailVerified: this.isEmailVerified,
    notificationPreferences: this.notificationPreferences || {
      dailyCheckIn: true,
      mindfulBreaths: true,
      affirmations: true,
    },
    themePreference: this.themePreference || 'system',
    createdAt: this.createdAt.toISOString(),
    updatedAt: this.updatedAt.toISOString(),
  };
};

export const User = model<IUserDocument>('User', UserSchema);
