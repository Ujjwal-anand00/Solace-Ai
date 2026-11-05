import { Types } from 'mongoose';
import { Assessment, AssessmentTypeMetadata, PaginationMeta } from '@solace/shared';
import { AssessmentModel } from './assessment.model';
import {
  ASSESSMENT_DEFINITIONS,
  evaluateAssessmentScore,
} from './assessmentDefinitions';
import { SubmitAssessmentInput } from './assessment.validator';
import { AppError, buildPaginationMeta, parsePagination } from '../../utils';
import { ProgressService } from '../progress/progress.service';

export class AssessmentService {
  /**
   * List all available assessment types with question counts and metadata
   */
  public static getAssessmentTypes(): AssessmentTypeMetadata[] {
    return Object.values(ASSESSMENT_DEFINITIONS).map((def) => ({
      ...def,
      questionCount: def.questions?.length || 0,
    }));
  }

  /**
   * Get a specific assessment type definition including its questions
   */
  public static getAssessmentType(type: string): AssessmentTypeMetadata {
    const definition = ASSESSMENT_DEFINITIONS[type];
    if (!definition) {
      throw AppError.notFound(`Assessment type '${type}' not found`);
    }
    return definition;
  }

  /**
   * Submit an assessment, compute score and category, and persist
   */
  public static async submitAssessment(
    userId: string,
    type: string,
    input: SubmitAssessmentInput,
  ): Promise<Assessment> {
    const definition = ASSESSMENT_DEFINITIONS[type];
    if (!definition) {
      throw AppError.badRequest(`Invalid assessment type: '${type}'`);
    }

    // Verify all questions are answered or calculate score from provided answers
    const totalScore = input.answers.reduce(
      (sum, ans) => sum + ans.selectedOption,
      0,
    );
    const maxScore = (definition.questions?.length || 4) * 3;

    // Evaluate score against non-diagnostic reflection bands
    const evaluation = evaluateAssessmentScore(type, totalScore);

    const assessment = await AssessmentModel.create({
      userId: new Types.ObjectId(userId),
      assessmentType: type,
      questionsVersion: input.questionsVersion || definition.questionsVersion,
      answers: input.answers,
      score: totalScore,
      maxScore,
      resultCategory: evaluation.resultCategory,
      interpretation: evaluation.interpretation,
      suggestedActivities: evaluation.suggestedActivities,
      recommendedNextSteps: evaluation.recommendedNextSteps,
      disclaimer: definition.disclaimer,
      completedAt: new Date(),
    });

    // Update user streak & activity count
    await ProgressService.recordActivity(userId, 'activity');

    return assessment.toDto();
  }

  /**
   * Get user's assessment history with pagination
   */
  public static async getUserAssessments(
    userId: string,
    rawPage?: unknown,
    rawLimit?: unknown,
  ): Promise<{ data: Assessment[]; meta: PaginationMeta }> {
    const { page, limit, skip } = parsePagination(rawPage, rawLimit);
    const filter = { userId: new Types.ObjectId(userId) };

    const [assessments, total] = await Promise.all([
      AssessmentModel.find(filter)
        .sort({ completedAt: -1 })
        .skip(skip)
        .limit(limit),
      AssessmentModel.countDocuments(filter),
    ]);

    const meta = buildPaginationMeta(total, page, limit);
    return {
      data: assessments.map((a) => a.toDto()),
      meta,
    };
  }

  /**
   * Get latest completed assessment for a given type
   */
  public static async getLatestAssessment(
    userId: string,
    type: string,
  ): Promise<Assessment | null> {
    const assessment = await AssessmentModel.findOne({
      userId: new Types.ObjectId(userId),
      assessmentType: type,
    }).sort({ completedAt: -1 });

    return assessment ? assessment.toDto() : null;
  }

  /**
   * Get single assessment by ID with strict ownership validation
   */
  public static async getAssessmentById(
    userId: string,
    assessmentId: string,
  ): Promise<Assessment> {
    if (!Types.ObjectId.isValid(assessmentId)) {
      throw AppError.badRequest('Invalid assessment ID format');
    }

    const assessment = await AssessmentModel.findById(assessmentId);
    if (!assessment) {
      throw AppError.notFound('Assessment not found');
    }

    if (assessment.userId.toString() !== userId) {
      throw AppError.forbidden('You do not have access to this assessment');
    }

    return assessment.toDto();
  }
}

