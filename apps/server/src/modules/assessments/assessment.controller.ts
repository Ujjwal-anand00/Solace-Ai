import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../types';
import { AssessmentService } from './assessment.service';
import { submitAssessmentSchema } from './assessment.validator';
import { ApiResponseUtil } from '../../utils';

export class AssessmentController {
  public static async getTypes(
    _req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const types = AssessmentService.getAssessmentTypes();
      ApiResponseUtil.success(res, 'Assessment types retrieved', types);
    } catch (err) {
      next(err);
    }
  }

  public static async getTypeDetail(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const definition = AssessmentService.getAssessmentType(req.params.type);
      ApiResponseUtil.success(res, 'Assessment definition retrieved', definition);
    } catch (err) {
      next(err);
    }
  }

  public static async submit(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const validated = submitAssessmentSchema.parse(req.body);
      const assessment = await AssessmentService.submitAssessment(
        req.user!.id,
        req.params.type,
        validated,
      );
      ApiResponseUtil.success(res, 'Assessment submitted successfully', assessment, 201);
    } catch (err) {
      next(err);
    }
  }

  public static async getHistory(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { data, meta } = await AssessmentService.getUserAssessments(
        req.user!.id,
        req.query.page,
        req.query.limit,
      );
      ApiResponseUtil.paginated(res, 'Assessment history retrieved', data, meta);
    } catch (err) {
      next(err);
    }
  }

  public static async getLatest(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const latest = await AssessmentService.getLatestAssessment(
        req.user!.id,
        req.params.type,
      );
      ApiResponseUtil.success(res, 'Latest assessment retrieved', latest);
    } catch (err) {
      next(err);
    }
  }

  public static async getById(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const assessment = await AssessmentService.getAssessmentById(
        req.user!.id,
        req.params.id,
      );
      ApiResponseUtil.success(res, 'Assessment retrieved', assessment);
    } catch (err) {
      next(err);
    }
  }
}
