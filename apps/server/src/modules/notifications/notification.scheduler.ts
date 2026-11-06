import cron, { ScheduledTask } from 'node-cron';
import { ReminderModel } from './reminder.model';
import { NotificationPreferencesModel } from './notification-preferences.model';
import { NotificationModel } from './notification.model';
import { Mood } from '../mood/mood.model';
import { WellnessPlanModel } from '../wellness-plans/wellnessPlan.model';
import { NotificationService } from './notification.service';
import { logger } from '../../utils/logger';

export class NotificationScheduler {
  private static task: ScheduledTask | null = null;
  private static isRunning = false;

  /**
   * Start the background scheduler (runs every minute: '* * * * *')
   */
  public static start(): void {
    if (this.task) return;

    logger.info('⏰ Initializing Solace AI Background Notification Scheduler...');
    this.task = cron.schedule('* * * * *', async () => {
      await this.processDueReminders();
      await this.processPendingNotifications();
    });
  }

  /**
   * Stop the background scheduler
   */
  public static stop(): void {
    if (this.task) {
      this.task.stop();
      this.task = null;
      logger.info('🛑 Notification Scheduler stopped.');
    }
  }

  /**
   * Helper: Check if local time falls within quiet hours
   */
  public static isWithinQuietHours(
    localTime: string,
    startTime: string,
    endTime: string,
  ): boolean {
    if (startTime === endTime) return false;
    if (startTime > endTime) {
      // Overnight (e.g. 22:00 to 08:00)
      return localTime >= startTime || localTime < endTime;
    }
    // Same-day (e.g. 13:00 to 15:00)
    return localTime >= startTime && localTime < endTime;
  }

  /**
   * Helper: Get current HH:mm and day of week in given timezone
   */
  public static getLocalTimeAndDay(timezone = 'UTC'): {
    time: string;
    dayOfWeek: number;
    dateString: string;
  } {
    try {
      const now = new Date();
      const timeFormatter = new Intl.DateTimeFormat('en-GB', {
        timeZone: timezone,
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
      const dateFormatter = new Intl.DateTimeFormat('en-CA', {
        timeZone: timezone,
      });

      const time = timeFormatter.format(now); // "HH:mm"
      const dateString = dateFormatter.format(now); // "YYYY-MM-DD"

      // Day of week calculation
      const dayName = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        weekday: 'short',
      }).format(now);
      const dayMap: Record<string, number> = {
        Sun: 0,
        Mon: 1,
        Tue: 2,
        Wed: 3,
        Thu: 4,
        Fri: 5,
        Sat: 6,
      };
      const dayOfWeek = dayMap[dayName] ?? now.getUTCDay();

      return { time, dayOfWeek, dateString };
    } catch {
      const now = new Date();
      const hours = String(now.getUTCHours()).padStart(2, '0');
      const mins = String(now.getUTCMinutes()).padStart(2, '0');
      return {
        time: `${hours}:${mins}`,
        dayOfWeek: now.getUTCDay(),
        dateString: now.toISOString().split('T')[0],
      };
    }
  }

  /**
   * Core scheduler loop: Scan for and process recurring user reminders
   */
  public static async processDueReminders(): Promise<void> {
    if (this.isRunning) return;
    this.isRunning = true;

    try {
      // Find all enabled scheduled reminders
      const reminders = await ReminderModel.find({ isEnabled: true });
      if (reminders.length === 0) {
        this.isRunning = false;
        return;
      }

      for (const reminder of reminders) {
        try {
          const userId = reminder.userId.toString();
          const prefs = await NotificationPreferencesModel.findOne({
            userId: reminder.userId,
          });

          // Rule 1: Respect master notification toggle
          if (prefs && !prefs.masterEnabled) {
            continue;
          }

          const timezone = prefs?.timezone || 'UTC';
          const { time: localTime, dayOfWeek, dateString } = this.getLocalTimeAndDay(timezone);

          // Rule 2: Check matching time & day of week
          if (reminder.time !== localTime) {
            continue;
          }
          if (
            reminder.daysOfWeek?.length &&
            !reminder.daysOfWeek.includes(dayOfWeek)
          ) {
            continue;
          }

          // Rule 3: Check quiet hours
          if (prefs?.quietHours?.enabled) {
            const { startTime, endTime } = prefs.quietHours;
            if (this.isWithinQuietHours(localTime, startTime, endTime)) {
              continue;
            }
          }

          // Rule 4: Category-specific preference toggles
          if (prefs) {
            if (reminder.type === 'daily_wellness' && !prefs.dailyWellness?.enabled) {
              continue;
            }
            if (
              (reminder.type === 'mood_checkin' || reminder.type === 'checkin') &&
              !prefs.moodCheckin?.enabled
            ) {
              continue;
            }
            if (reminder.type === 'plan_task' && !prefs.planReminders?.enabled) {
              continue;
            }
            if (reminder.type === 'breathing' && !prefs.breathingReminders?.enabled) {
              continue;
            }
            if (
              (reminder.type === 'streak_alert' || reminder.type === 'achievement') &&
              !prefs.milestones?.enabled
            ) {
              continue;
            }
            if (reminder.type === 'weekly_summary' && !prefs.weeklySummary?.enabled) {
              continue;
            }
          }

          // Rule 5: Suppress mood check-in reminder if user already checked in today
          if (reminder.type === 'mood_checkin' || reminder.type === 'checkin') {
            const startOfDay = new Date(`${dateString}T00:00:00.000Z`);
            const endOfDay = new Date(`${dateString}T23:59:59.999Z`);
            const moodDone = await Mood.findOne({
              userId: reminder.userId,
              createdAt: { $gte: startOfDay, $lte: endOfDay },
            });
            if (moodDone) {
              continue; // Suppress
            }
          }

          // Rule 6: Suppress plan task reminder if task is already completed
          if (reminder.type === 'plan_task' && reminder.relatedResourceId) {
            const plan = await WellnessPlanModel.findOne({
              userId: reminder.userId,
              status: 'active',
            });
            const task = plan?.dailyTasks?.find(
              (t) => t.id === reminder.relatedResourceId,
            );
            if (task && (task.completed || task.skipped)) {
              continue; // Suppress
            }
          }

          // Rule 7: Prevent duplicate reminder execution on the same calendar day
          if (reminder.lastTriggeredAt) {
            const lastTriggeredDateStr = new Intl.DateTimeFormat('en-CA', {
              timeZone: timezone,
            }).format(reminder.lastTriggeredAt);
            if (lastTriggeredDateStr === dateString) {
              continue;
            }
          }

          // Dispatch notification
          await NotificationService.dispatchNotification(
            userId,
            reminder.type,
            reminder.title,
            reminder.message,
            reminder.deepLink,
            reminder.relatedResourceId,
          );

          reminder.lastTriggeredAt = new Date();
          await reminder.save();
        } catch (itemErr) {
          logger.error('Error processing reminder item:', itemErr);
        }
      }
    } catch (err) {
      logger.error('Error in processDueReminders:', err);
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Process one-off scheduled notifications pending in MongoDB with atomic claiming
   */
  public static async processPendingNotifications(): Promise<void> {
    const now = new Date();

    // Atomic claim to prevent multi-instance race conditions
    const pendingDoc = await NotificationModel.findOneAndUpdate(
      {
        status: 'pending',
        scheduledAt: { $lte: now },
        $or: [
          { claimedAt: { $exists: false } },
          { claimedAt: { $lt: new Date(Date.now() - 5 * 60 * 1000) } }, // 5 min timeout
        ],
      },
      {
        $set: { claimedAt: now },
      },
      { new: true },
    );

    if (!pendingDoc) return;

    try {
      // Dispatch push if active devices exist
      const userId = pendingDoc.userId.toString();
      const devices = await NotificationService.getUserDevices(userId);

      if (devices.length > 0) {
        await NotificationService.dispatchNotification(
          userId,
          pendingDoc.type,
          pendingDoc.title,
          pendingDoc.message,
          pendingDoc.deepLink,
          pendingDoc.relatedResourceId,
          pendingDoc.metadata,
        );
      }

      pendingDoc.status = 'sent';
      pendingDoc.sentAt = new Date();
      await pendingDoc.save();
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      pendingDoc.deliveryAttempts += 1;
      pendingDoc.lastDeliveryError = errorMsg;
      if (pendingDoc.deliveryAttempts >= 3) {
        pendingDoc.status = 'failed';
      }
      await pendingDoc.save();
    }
  }
}
