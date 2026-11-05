import { Types } from 'mongoose';
import { NotificationModel } from './notification.model';

export class NotificationService {
  public static async getUnreadCount(userId: string): Promise<number> {
    return NotificationModel.countDocuments({
      userId: new Types.ObjectId(userId),
      status: { $in: ['pending', 'sent'] },
    });
  }
}

