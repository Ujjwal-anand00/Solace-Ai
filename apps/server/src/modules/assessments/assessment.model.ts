import { Schema, model, Document, Types } from 'mongoose';
import { Assessment } from '@solace/shared';

export interface IAssessmentDocument extends Document {
  userId: Types.ObjectId;
  assessmentType: string;
  questionsVersion: string;
  answers: Array<{ questionId: string; selectedOption: number }>;
  score: number;
  resultCategory: string;
  interpretation: string;
  disclaimer: string;
  completedAt: Date;
  createdAt: Date;
  updatedAt: Date;
  toDto(): Assessment;
}

const AssessmentSchema = new Schema<IAssessmentDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    assessmentType: {
      type: String,
      required: [true, 'Assessment type is required'],
      trim: true,
    },
    questionsVersion: {
      type: String,
      default: '1.0',
    },
    answers: [
      {
        questionId: { type: String, required: true },
        selectedOption: { type: Number, required: true },
      },
    ],
    score: {
      type: Number,
      required: [true, 'Score is required'],
    },
    resultCategory: {
      type: String,
      required: [true, 'Result category is required'],
    },
    interpretation: {
      type: String,
      required: [true, 'Interpretation is required'],
    },
    disclaimer: {
      type: String,
      default:
        'This self-check is strictly for informational and reflective purposes. It does not constitute a clinical diagnosis or medical assessment. If you are experiencing distress, please consult a qualified healthcare professional.',
    },
    completedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

AssessmentSchema.index({ userId: 1, completedAt: -1 });

AssessmentSchema.methods.toDto = function (): Assessment {
  const obj = this.toObject();
  return {
    id: obj._id.toString(),
    userId: obj.userId.toString(),
    assessmentType: obj.assessmentType,
    questionsVersion: obj.questionsVersion,
    answers: obj.answers,
    score: obj.score,
    resultCategory: obj.resultCategory,
    interpretation: obj.interpretation,
    disclaimer: obj.disclaimer,
    completedAt: obj.completedAt.toISOString(),
    createdAt: obj.createdAt.toISOString(),
    updatedAt: obj.updatedAt.toISOString(),
  };
};

export const AssessmentModel = model<IAssessmentDocument>('Assessment', AssessmentSchema);
