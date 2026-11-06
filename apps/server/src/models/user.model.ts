import { Schema, model, Document } from 'mongoose';
import {
  UserProfile,
  UserNotificationPreferences,
  UserWellnessPreferences,
  UserAccessibilityPreferences,
} from '@solace/shared';

export interface IUserDocument extends Document {
  name: string;
  preferredName?: string;
  email: string;
  passwordHash: string;
  avatarUrl?: string;
  dateOfBirth?: Date;
  bio?: string;
  timezone?: string;
  language?: 'en' | 'hi' | 'pa';
  wellnessGoals: string[];
  wellnessPreferences?: UserWellnessPreferences;
  accessibilityPreferences?: UserAccessibilityPreferences;
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
    bio: {
      type: String,
      maxlength: 300,
      default: '',
    },
    timezone: {
      type: String,
      default: 'UTC',
    },
    language: {
      type: String,
      enum: ['en', 'hi', 'pa'],
      default: 'en',
    },
    wellnessGoals: {
      type: [String],
      default: [],
    },
    wellnessPreferences: {
      goals: { type: [String], default: [] },
      preferredActivityDurationMinutes: { type: Number, default: 10 },
      preferredCategories: { type: [String], default: ['breathing', 'mindfulness'] },
      preferredDailyTime: { type: String, default: '09:00' },
      reminderDays: { type: [Number], default: [1, 2, 3, 4, 5] },
    },
    accessibilityPreferences: {
      reduceMotion: { type: Boolean, default: false },
      highContrast: { type: Boolean, default: false },
      hapticFeedback: { type: Boolean, default: true },
      fontScale: { type: Number, default: 1.0 },
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
    bio: this.bio || '',
    timezone: this.timezone || 'UTC',
    language: this.language || 'en',
    wellnessGoals: this.wellnessGoals || [],
    wellnessPreferences: this.wellnessPreferences || {
      goals: this.wellnessGoals || [],
      preferredActivityDurationMinutes: 10,
      preferredCategories: ['breathing', 'mindfulness'],
      preferredDailyTime: '09:00',
      reminderDays: [1, 2, 3, 4, 5],
    },
    accessibilityPreferences: this.accessibilityPreferences || {
      reduceMotion: false,
      highContrast: false,
      hapticFeedback: true,
      fontScale: 1.0,
    },
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
