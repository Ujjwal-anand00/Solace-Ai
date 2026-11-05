import { GoogleGenAI } from '@google/genai';
import { env } from '../../config/env';
import { logger } from '../../utils/logger';

export interface GeminiConfigOptions {
  apiKey?: string;
  defaultModel?: string;
}

/**
 * Gemini Provider Client Manager
 * Handles lazy initialization and credential management for Google Gemini AI.
 */
export class GeminiProvider {
  private static instance: GoogleGenAI | null = null;
  private static modelName: string = env.GEMINI_MODEL;

  /**
   * Lazily retrieve the Gemini client instance
   */
  public static getClient(): GoogleGenAI {
    if (!GeminiProvider.instance) {
      const apiKey = env.GEMINI_API_KEY;

      if (!apiKey) {
        logger.warn(
          'GEMINI_API_KEY is not configured in server environment. Gemini operations will fail until key is supplied.',
        );
      }

      GeminiProvider.instance = new GoogleGenAI({
        apiKey: apiKey || 'unconfigured',
      });
      logger.info('Gemini provider initialized.');
    }

    return GeminiProvider.instance;
  }

  /**
   * Check if Gemini API key is configured
   */
  public static isConfigured(): boolean {
    return Boolean(env.GEMINI_API_KEY && env.GEMINI_API_KEY.trim().length > 0);
  }

  /**
   * Default configured model name
   */
  public static get defaultModel(): string {
    return GeminiProvider.modelName;
  }
}
