import { DeviceModel } from './device.model';
import { logger } from '../../utils/logger';

export interface PushMessagePayload {
  to: string; // Expo push token
  title: string;
  body: string;
  data?: Record<string, unknown>;
  sound?: 'default' | null;
  priority?: 'default' | 'normal' | 'high';
  channelId?: string;
}

export interface PushTicketResult {
  token: string;
  success: boolean;
  ticketId?: string;
  error?: string;
}

export class NotificationDeliveryService {
  private static readonly EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

  /**
   * Determine whether a string looks like a valid Expo push token
   */
  public static isExpoPushToken(token: string): boolean {
    return (
      typeof token === 'string' &&
      (((token.startsWith('ExponentPushToken[') || token.startsWith('ExpoPushToken[')) &&
        token.endsWith(']')) ||
        /^[a-z0-9-_]{22,}$/i.test(token))
    );
  }

  /**
   * Send a batch of push messages via Expo Push Service
   */
  public static async sendPushBatch(messages: PushMessagePayload[]): Promise<PushTicketResult[]> {
    if (messages.length === 0) return [];

    const validMessages = messages.filter((m) => this.isExpoPushToken(m.to));
    const results: PushTicketResult[] = [];

    // Mark invalid tokens as error immediately
    messages.forEach((m) => {
      if (!this.isExpoPushToken(m.to)) {
        results.push({
          token: m.to,
          success: false,
          error: 'InvalidExpoPushToken',
        });
      }
    });

    if (validMessages.length === 0) return results;

    try {
      const response = await fetch(this.EXPO_PUSH_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'Accept-Encoding': 'gzip, deflate',
        },
        body: JSON.stringify(validMessages),
      });

      if (!response.ok) {
        logger.error(`Expo push endpoint returned status ${response.status}`);
        validMessages.forEach((m) => {
          results.push({
            token: m.to,
            success: false,
            error: `HttpError_${response.status}`,
          });
        });
        return results;
      }

      const resJson = (await response.json()) as {
        data: Array<{
          status: 'ok' | 'error';
          id?: string;
          message?: string;
          details?: { error?: string };
        }>;
      };

      const tickets = resJson.data || [];
      for (let i = 0; i < validMessages.length; i++) {
        const msg = validMessages[i];
        const ticket = tickets[i];

        if (ticket && ticket.status === 'ok') {
          results.push({
            token: msg.to,
            success: true,
            ticketId: ticket.id,
          });
        } else {
          const errCode = ticket?.details?.error || ticket?.message || 'UnknownDeliveryError';
          results.push({
            token: msg.to,
            success: false,
            error: errCode,
          });

          // If device is not registered anymore, automatically deactivate it
          if (errCode === 'DeviceNotRegistered') {
            try {
              await DeviceModel.updateMany({ token: msg.to }, { $set: { isActive: false } });
              logger.info(`Deactivated stale push token: ${msg.to.slice(0, 15)}...`);
            } catch {
              // Gracefully handle if DB connection closed
            }
          }
        }
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      logger.error('Failed to communicate with Expo push service:', errorMsg);
      validMessages.forEach((m) => {
        results.push({
          token: m.to,
          success: false,
          error: errorMsg,
        });
      });
    }

    return results;
  }
}
