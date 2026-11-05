import { Types } from 'mongoose';
import { WellnessPlanModel } from './wellnessPlan.model';
import { WellnessPlan } from '@solace/shared';

export class WellnessPlanService {
  public static async getCurrentPlan(userId: string): Promise<WellnessPlan | null> {
    const plan = await WellnessPlanModel.findOne({
      userId: new Types.ObjectId(userId),
      status: 'active',
    }).sort({ createdAt: -1 });

    return plan ? plan.toDto() : null;
  }
}

