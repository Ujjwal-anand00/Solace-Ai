import { Types } from 'mongoose';
import bcrypt from 'bcrypt';
import { User, IUserDocument } from '../../models/user.model';
import { Session } from '../../models/session.model';
import { Mood } from '../mood/mood.model';
import { Journal } from '../journal/journal.model';
import { ConversationModel } from '../conversations/conversation.model';
import { ChatMessageModel } from '../companion/chatMessage.model';
import { CompanionSettingsModel } from '../companion/companionSettings.model';
import { ActivityCompletionModel } from '../activities/activityCompletion.model';
import { AssessmentModel } from '../assessments/assessment.model';
import { WellnessPlanModel } from '../wellness-plans/wellnessPlan.model';
import { DeviceModel } from '../notifications/device.model';
import { ReminderModel } from '../notifications/reminder.model';
import { NotificationModel } from '../notifications/notification.model';
import { FeedbackModel } from '../../models/feedback.model';
import { DataExportModel } from '../../models/dataExport.model';
import {
  UserProfile,
  UserSessionInfo,
  DataExportResponse,
  CreateFeedbackDto,
  ChangePasswordDto,
} from '@solace/shared';
import { AppError } from '../../utils';

export class UserService {
  /**
   * Get user profile by ID
   */
  public static async getProfile(userId: string): Promise<UserProfile> {
    const user = await User.findById(userId);
    if (!user || !user.isActive) {
      throw AppError.notFound('User account not found');
    }
    return user.toProfileJSON();
  }

  /**
   * Update profile fields
   */
  public static async updateProfile(
    userId: string,
    updates: Partial<IUserDocument>,
  ): Promise<UserProfile> {
    const user = await User.findById(userId);
    if (!user || !user.isActive) {
      throw AppError.notFound('User account not found');
    }

    if (updates.name !== undefined) user.name = updates.name;
    if (updates.preferredName !== undefined) user.preferredName = updates.preferredName;
    if (updates.avatarUrl !== undefined) user.avatarUrl = updates.avatarUrl;
    if (updates.dateOfBirth !== undefined) user.dateOfBirth = updates.dateOfBirth;
    if (updates.bio !== undefined) user.bio = updates.bio;
    if (updates.timezone !== undefined) user.timezone = updates.timezone;
    if (updates.language !== undefined) user.language = updates.language;
    if (updates.wellnessGoals !== undefined) user.wellnessGoals = updates.wellnessGoals;
    if (updates.themePreference !== undefined) user.themePreference = updates.themePreference;

    await user.save();
    return user.toProfileJSON();
  }

  /**
   * Update wellness or accessibility preferences
   */
  public static async updatePreferences(
    userId: string,
    preferences: {
      wellnessPreferences?: Record<string, unknown>;
      accessibilityPreferences?: Record<string, unknown>;
      themePreference?: 'light' | 'dark' | 'system';
    },
  ): Promise<UserProfile> {
    const user = await User.findById(userId);
    if (!user || !user.isActive) {
      throw AppError.notFound('User account not found');
    }

    if (preferences.wellnessPreferences) {
      user.wellnessPreferences = {
        ...user.wellnessPreferences,
        ...preferences.wellnessPreferences,
      } as any;
    }

    if (preferences.accessibilityPreferences) {
      user.accessibilityPreferences = {
        ...user.accessibilityPreferences,
        ...preferences.accessibilityPreferences,
      } as any;
    }

    if (preferences.themePreference) {
      user.themePreference = preferences.themePreference;
    }

    await user.save();
    return user.toProfileJSON();
  }

  /**
   * Remove avatar URL
   */
  public static async removeAvatar(userId: string): Promise<UserProfile> {
    const user = await User.findById(userId);
    if (!user || !user.isActive) {
      throw AppError.notFound('User account not found');
    }
    user.avatarUrl = '';
    await user.save();
    return user.toProfileJSON();
  }

  /**
   * Change user password securely
   */
  public static async changePassword(
    userId: string,
    dto: ChangePasswordDto,
  ): Promise<void> {
    const user = await User.findById(userId).select('+passwordHash');
    if (!user || !user.isActive) {
      throw AppError.notFound('User account not found');
    }

    const isMatch = await bcrypt.compare(dto.currentPassword, user.passwordHash);
    if (!isMatch) {
      throw AppError.badRequest('Current password is incorrect');
    }

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(dto.newPassword, salt);
    await user.save();

    // Invalidate other active sessions
    await Session.updateMany(
      { userId: user._id, isRevoked: false },
      { $set: { isRevoked: true } },
    );
  }

  /**
   * List active sessions for user
   */
  public static async getSessions(userId: string): Promise<UserSessionInfo[]> {
    const sessions = await Session.find({
      userId: new Types.ObjectId(userId),
      isRevoked: false,
      expiresAt: { $gt: new Date() },
    }).sort({ createdAt: -1 });

    return sessions.map((s, idx) => ({
      id: s._id.toString(),
      userAgent: s.userAgent || 'Solace App Mobile Client',
      ipAddress: s.ipAddress || '127.0.0.1',
      isCurrent: idx === 0, // Most recent session considered current
      createdAt: s.createdAt.toISOString(),
      expiresAt: s.expiresAt.toISOString(),
    }));
  }

  /**
   * Revoke a specific session
   */
  public static async revokeSession(userId: string, sessionId: string): Promise<void> {
    if (!Types.ObjectId.isValid(sessionId)) {
      throw AppError.badRequest('Invalid session ID format');
    }
    const session = await Session.findOne({
      _id: new Types.ObjectId(sessionId),
      userId: new Types.ObjectId(userId),
    });

    if (!session) {
      throw AppError.notFound('Session not found');
    }

    session.isRevoked = true;
    await session.save();
  }

  /**
   * Logout from all sessions
   */
  public static async logoutAll(userId: string): Promise<void> {
    await Session.updateMany(
      { userId: new Types.ObjectId(userId), isRevoked: false },
      { $set: { isRevoked: true } },
    );
  }

  /**
   * Generate comprehensive data export package
   */
  public static async generateDataExport(userId: string): Promise<DataExportResponse> {
    const userObjectId = new Types.ObjectId(userId);
    const user = await User.findById(userObjectId);
    if (!user) throw AppError.notFound('User not found');

    const [
      moods,
      journals,
      conversations,
      completions,
      assessments,
      plans,
      companionSettings,
    ] = await Promise.all([
      Mood.find({ userId: userObjectId }).lean(),
      Journal.find({ userId: userObjectId }).lean(),
      ConversationModel.find({ userId: userObjectId }).lean(),
      ActivityCompletionModel.find({ userId: userObjectId }).lean(),
      AssessmentModel.find({ userId: userObjectId }).lean(),
      WellnessPlanModel.find({ userId: userObjectId }).lean(),
      CompanionSettingsModel.findOne({ userId: userObjectId }).lean(),
    ]);

    const exportPayload = {
      exportVersion: '1.0',
      exportedAt: new Date().toISOString(),
      userProfile: user.toProfileJSON(),
      companionSettings: companionSettings || null,
      records: {
        totalMoodEntries: moods.length,
        moodEntries: moods,
        totalJournalEntries: journals.length,
        journalEntries: journals,
        totalConversations: conversations.length,
        conversations: conversations,
        activityCompletions: completions,
        assessments: assessments,
        wellnessPlans: plans,
      },
    };

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days expiring
    const exportDoc = await DataExportModel.create({
      userId: userObjectId,
      status: 'ready',
      payload: exportPayload,
      expiresAt,
    });

    return {
      exportId: exportDoc._id.toString(),
      status: 'ready',
      generatedAt: exportDoc.createdAt.toISOString(),
      expiresAt: exportDoc.expiresAt.toISOString(),
      data: exportPayload,
    };
  }

  /**
   * Retrieve an existing export by ID
   */
  public static async getExportById(
    userId: string,
    exportId: string,
  ): Promise<DataExportResponse> {
    if (!Types.ObjectId.isValid(exportId)) {
      throw AppError.badRequest('Invalid export ID format');
    }

    const doc = await DataExportModel.findOne({
      _id: new Types.ObjectId(exportId),
      userId: new Types.ObjectId(userId),
    });

    if (!doc) {
      throw AppError.notFound('Export archive not found or expired');
    }

    return {
      exportId: doc._id.toString(),
      status: doc.status,
      generatedAt: doc.createdAt.toISOString(),
      expiresAt: doc.expiresAt.toISOString(),
      data: doc.payload as Record<string, unknown>,
    };
  }

  /**
   * Submit app feedback
   */
  public static async submitFeedback(
    userId: string,
    dto: CreateFeedbackDto,
  ): Promise<void> {
    await FeedbackModel.create({
      userId: new Types.ObjectId(userId),
      category: dto.category,
      message: dto.message,
      rating: dto.rating,
    });
  }

  /**
   * Permanently delete user account and cascade delete all personal data
   */
  public static async deleteAccount(userId: string): Promise<void> {
    const userObjectId = new Types.ObjectId(userId);
    const user = await User.findById(userObjectId);
    if (!user) {
      throw AppError.notFound('User account not found');
    }

    // 1. Cancel active reminders & notifications
    await Promise.all([
      ReminderModel.deleteMany({ userId: userObjectId }),
      NotificationModel.deleteMany({ userId: userObjectId }),
      DeviceModel.deleteMany({ userId: userObjectId }),
    ]);

    // 2. Cascade delete all personal sensitive data
    await Promise.all([
      Mood.deleteMany({ userId: userObjectId }),
      Journal.deleteMany({ userId: userObjectId }),
      ConversationModel.deleteMany({ userId: userObjectId }),
      ChatMessageModel.deleteMany({ userId: userObjectId }),
      CompanionSettingsModel.deleteMany({ userId: userObjectId }),
      ActivityCompletionModel.deleteMany({ userId: userObjectId }),
      AssessmentModel.deleteMany({ userId: userObjectId }),
      WellnessPlanModel.deleteMany({ userId: userObjectId }),
      Session.deleteMany({ userId: userObjectId }),
      DataExportModel.deleteMany({ userId: userObjectId }),
    ]);

    // 3. Delete user document
    await User.findByIdAndDelete(userObjectId);
  }
}

