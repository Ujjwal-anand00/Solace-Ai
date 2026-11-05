import bcrypt from 'bcrypt';
import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '../config/env';
import { AuthTokenPayload } from '@solace/shared';

const SALT_ROUNDS = 12;

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
   * Generate JWT authentication token
   */
  public static generateToken(
    payload: AuthTokenPayload,
    expiresIn: SignOptions['expiresIn'] = '7d',
  ): string {
    return jwt.sign(payload, env.JWT_SECRET, { expiresIn });
  }

  /**
   * Verify and decode a JWT authentication token
   */
  public static verifyToken(token: string): AuthTokenPayload {
    return jwt.verify(token, env.JWT_SECRET) as AuthTokenPayload;
  }
}
