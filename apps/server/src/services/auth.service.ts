import crypto from 'crypto';
import bcrypt from 'bcrypt';
import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '../config/env';
import {
  AuthTokenPayload,
  AuthResponse,
  RegisterDto,
  LoginDto,
  RefreshTokenDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  UpdateProfileDto,
  UserProfile,
} from '@solace/shared';
import { User, IUserDocument } from '../models/user.model';
import { Session } from '../models/session.model';
import { AppError } from '../utils/apiError';
import { EmailService } from './email.service';

const SALT_ROUNDS = 12;
const ACCESS_TOKEN_EXPIRY = '15m'; // 15 minutes
const ACCESS_TOKEN_EXPIRY_SECONDS = 15 * 60; // 900 seconds
const REFRESH_TOKEN_DAYS = 7;

interface RequestMetadata {
  userAgent?: string;
  ipAddress?: string;
}

export class AuthService {
  /**
   * Hash a plain text password with bcrypt
   */
  public static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS);
  }

  /**
   * Compare a plain text password with a hashed password
   */
  public static async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Generate SHA-256 hash for high-entropy tokens (refresh tokens, reset tokens)
   */
  public static hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  /**
   * Generate JWT access token
   */
  public static generateAccessToken(
    payload: AuthTokenPayload,
    expiresIn: SignOptions['expiresIn'] = ACCESS_TOKEN_EXPIRY,
  ): string {
    return jwt.sign(payload, env.JWT_SECRET, { expiresIn });
  }

  /**
   * Generate cryptographically secure random refresh token and its hash
   */
  public static generateRefreshToken(): { token: string; hash: string } {
    const token = crypto.randomBytes(40).toString('hex');
    const hash = this.hashToken(token);
    return { token, hash };
  }

  /**
   * Verify and decode a JWT access token
   */
  public static verifyAccessToken(token: string): AuthTokenPayload {
    try {
      return jwt.verify(token, env.JWT_SECRET) as AuthTokenPayload;
    } catch {
      throw AppError.unauthorized('Invalid or expired authentication token');
    }
  }

  /**
   * Register a new user account
   */
  public static async register(dto: RegisterDto, meta?: RequestMetadata): Promise<AuthResponse> {
    const email = dto.email.toLowerCase().trim();

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw AppError.conflict('An account with this email address already exists');
    }

    // Hash password
    const passwordHash = await this.hashPassword(dto.password);

    // Create User
    const user = new User({
      name: dto.name.trim(),
      email,
      passwordHash,
      wellnessGoals: dto.wellnessGoals || [],
      onboardingCompleted: dto.onboardingCompleted ?? true,
      notificationPreferences: dto.notificationPreferences || {
        dailyCheckIn: true,
        mindfulBreaths: true,
        affirmations: true,
      },
    });

    await user.save();

    // Issue Session & Tokens
    return this.createSessionAndIssueTokens(user, meta);
  }

  /**
   * Authenticate user with email and password
   */
  public static async login(dto: LoginDto, meta?: RequestMetadata): Promise<AuthResponse> {
    const email = dto.email.toLowerCase().trim();

    // Find user including hidden passwordHash
    const user = await User.findOne({ email, isActive: true }).select('+passwordHash');
    if (!user) {
      throw AppError.unauthorized('Invalid email or password');
    }

    const isPasswordValid = await this.comparePassword(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw AppError.unauthorized('Invalid email or password');
    }

    // Issue Session & Tokens
    return this.createSessionAndIssueTokens(user, meta);
  }

  /**
   * Refresh session and rotate tokens
   */
  public static async refreshTokens(
    dto: RefreshTokenDto,
    meta?: RequestMetadata,
  ): Promise<AuthResponse> {
    const incomingTokenHash = this.hashToken(dto.refreshToken);

    // Find active non-revoked session
    const session = await Session.findOne({
      refreshTokenHash: incomingTokenHash,
      isRevoked: false,
      expiresAt: { $gt: new Date() },
    });

    if (!session) {
      throw AppError.unauthorized('Session expired or invalid. Please sign in again.');
    }

    // Find user
    const user = await User.findById(session.userId);
    if (!user || !user.isActive) {
      throw AppError.unauthorized('User account not found or deactivated');
    }

    // Token Rotation: revoke current session
    session.isRevoked = true;
    await session.save();

    // Issue new session and tokens
    return this.createSessionAndIssueTokens(user, meta);
  }

  /**
   * Logout user by revoking the refresh session
   */
  public static async logout(refreshToken: string): Promise<void> {
    if (!refreshToken) return;
    const tokenHash = this.hashToken(refreshToken);
    await Session.updateOne({ refreshTokenHash: tokenHash }, { isRevoked: true });
  }

  /**
   * Request password reset
   */
  public static async forgotPassword(dto: ForgotPasswordDto): Promise<void> {
    const email = dto.email.toLowerCase().trim();
    const user = await User.findOne({ email, isActive: true });

    // Always resolve gracefully to prevent account enumeration
    if (!user) return;

    // Generate single-use random reset token
    const rawResetToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = this.hashToken(rawResetToken);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    user.passwordResetTokenHash = tokenHash;
    user.passwordResetExpires = expiresAt;
    await user.save();

    const clientUrl = env.CLIENT_URL.split(',')[0].trim() || 'http://localhost:8081';
    const resetUrl = `${clientUrl}/reset-password?token=${rawResetToken}`;

    await EmailService.sendPasswordResetEmail({
      email: user.email,
      name: user.name,
      resetToken: rawResetToken,
      resetUrl,
    });
  }

  /**
   * Reset password with valid reset token
   */
  public static async resetPassword(dto: ResetPasswordDto): Promise<void> {
    const tokenHash = this.hashToken(dto.token);

    const user = await User.findOne({
      passwordResetTokenHash: tokenHash,
      passwordResetExpires: { $gt: new Date() },
    }).select('+passwordResetTokenHash +passwordResetExpires');

    if (!user) {
      throw AppError.badRequest('Invalid or expired password reset token');
    }

    // Update password hash
    user.passwordHash = await this.hashPassword(dto.newPassword);
    user.passwordResetTokenHash = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    // Revoke all existing sessions for security
    await Session.updateMany({ userId: user._id }, { isRevoked: true });
  }

  /**
   * Get user profile by ID
   */
  public static async getProfile(userId: string): Promise<UserProfile> {
    const user = await User.findById(userId);
    if (!user || !user.isActive) {
      throw AppError.notFound('User not found');
    }
    return user.toProfileJSON();
  }

  /**
   * Update user profile
   */
  public static async updateProfile(userId: string, dto: UpdateProfileDto): Promise<UserProfile> {
    const user = await User.findById(userId);
    if (!user || !user.isActive) {
      throw AppError.notFound('User not found');
    }

    if (dto.name !== undefined) user.name = dto.name.trim();
    if (dto.preferredName !== undefined) user.preferredName = dto.preferredName.trim();
    if (dto.avatarUrl !== undefined) user.avatarUrl = dto.avatarUrl.trim();
    if (dto.dateOfBirth !== undefined) {
      user.dateOfBirth = dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined;
    }
    if (dto.wellnessGoals !== undefined) user.wellnessGoals = dto.wellnessGoals;
    if (dto.themePreference !== undefined) user.themePreference = dto.themePreference;
    if (dto.notificationPreferences !== undefined) {
      user.notificationPreferences = {
        ...user.notificationPreferences,
        ...dto.notificationPreferences,
      };
    }

    await user.save();
    return user.toProfileJSON();
  }

  /**
   * Delete account and revoke all sessions
   */
  public static async deleteAccount(userId: string): Promise<void> {
    const user = await User.findById(userId);
    if (!user) {
      throw AppError.notFound('User not found');
    }

    // Invalidate all active sessions
    await Session.updateMany({ userId: user._id }, { isRevoked: true });

    // Permanently remove user
    await User.findByIdAndDelete(userId);
  }

  /**
   * Helper: Generate access token + refresh token and persist Session
   */
  private static async createSessionAndIssueTokens(
    user: IUserDocument,
    meta?: RequestMetadata,
  ): Promise<AuthResponse> {
    const accessToken = this.generateAccessToken({
      userId: user._id.toString(),
      email: user.email,
    });

    const { token: refreshToken, hash: refreshTokenHash } = this.generateRefreshToken();

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_DAYS);

    await Session.create({
      userId: user._id,
      refreshTokenHash,
      userAgent: meta?.userAgent || '',
      ipAddress: meta?.ipAddress || '',
      expiresAt,
      isRevoked: false,
    });

    return {
      user: user.toProfileJSON(),
      tokens: {
        accessToken,
        refreshToken,
        expiresIn: ACCESS_TOKEN_EXPIRY_SECONDS,
      },
    };
  }
}
