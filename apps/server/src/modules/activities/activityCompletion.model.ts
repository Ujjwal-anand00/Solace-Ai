import { Schema, model, Document, Types } from 'mongoose';
import { ActivityCompletion, WellnessActivity } from '@solace/shared';

export interface IActivityCompletionDocument extends Document {
  userId: Types.ObjectId;
  activityId: Types.ObjectId;
  durationCompleted: number;
  completedAt: Date;
  feedback?: string;
  createdAt: Date;
  updatedAt: Date;
  toDto(populatedActivity?: WellnessActivity): ActivityCompletion;
}

const ActivityCompletionSchema = new Schema<IActivityCompletionDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    activityId: {
      type: Schema.Types.ObjectId,
      ref: 'Activity',
      required: [true, 'Activity ID is required'],
      index: true,
    },
    durationCompleted: {
      type: Number,
      required: [true, 'Duration completed is required'],
      min: [1, 'Duration must be at least 1 second'],
    },
    completedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    feedback: {
      type: String,
      trim: true,
      maxlength: [500, 'Feedback cannot exceed 500 characters'],
    },
  },
  {
    timestamps: true,
  },
);

ActivityCompletionSchema.index({ userId: 1, completedAt: -1 });
ActivityCompletionSchema.index({ userId: 1, activityId: 1 });

ActivityCompletionSchema.methods.toDto = function (
  populatedActivity?: WellnessActivity,
): ActivityCompletion {
  const obj = this.toObject();
  const rawActivity = obj.activityId;
  let activityDto = populatedActivity;

  if (!activityDto && rawActivity && typeof rawActivity === 'object' && rawActivity.title) {
    activityDto = {
      id: rawActivity._id.toString(),
      title: rawActivity.title,
      description: rawActivity.description,
      category: rawActivity.category,
      duration: rawActivity.duration,
      difficulty: rawActivity.difficulty,
      instructions: rawActivity.instructions || [],
      isActive: rawActivity.isActive,
      createdAt: rawActivity.createdAt?.toISOString?.() || new Date().toISOString(),
      updatedAt: rawActivity.updatedAt?.toISOString?.() || new Date().toISOString(),
    };
  }

  return {
    id: obj._id.toString(),
    userId: obj.userId.toString(),
    activityId: rawActivity && typeof rawActivity === 'object' ? rawActivity._id.toString() : obj.activityId.toString(),
    activity: activityDto,
    durationCompleted: obj.durationCompleted,
    completedAt: obj.completedAt.toISOString(),
    feedback: obj.feedback,
    createdAt: obj.createdAt.toISOString(),
    updatedAt: obj.updatedAt.toISOString(),
  };
};

export const ActivityCompletionModel = model<IActivityCompletionDocument>(
  'ActivityCompletion',
  ActivityCompletionSchema,
);
