import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../types';
import { ConversationService } from './conversation.service';
import { ApiResponseUtil } from '../../utils';

export class ConversationController {
  public static async create(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const result = await ConversationService.createConversation(req.user!.id, req.body);
      ApiResponseUtil.success(res, 'Conversation created successfully', result, 201);
    } catch (err) {
      next(err);
    }
  }

  public static async list(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { page, limit } = req.query;
      const result = await ConversationService.getConversations(req.user!.id, page, limit);
      ApiResponseUtil.paginated(res, 'Conversations retrieved successfully', result.data, result.pagination);
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
      const conversation = await ConversationService.getConversationById(req.params.id, req.user!.id);
      ApiResponseUtil.success(res, 'Conversation retrieved successfully', conversation);
    } catch (err) {
      next(err);
    }
  }

  public static async update(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const conversation = await ConversationService.updateConversation(
        req.params.id,
        req.user!.id,
        req.body,
      );
      ApiResponseUtil.success(res, 'Conversation updated successfully', conversation);
    } catch (err) {
      next(err);
    }
  }

  public static async delete(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const result = await ConversationService.deleteConversation(req.params.id, req.user!.id);
      ApiResponseUtil.success(res, result.message, null);
    } catch (err) {
      next(err);
    }
  }

  public static async getMessages(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { page, limit } = req.query;
      const result = await ConversationService.getMessages(
        req.params.id,
        req.user!.id,
        page,
        limit,
      );
      ApiResponseUtil.paginated(res, 'Messages retrieved successfully', result.data, result.pagination);
    } catch (err) {
      next(err);
    }
  }

  public static async sendMessage(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const result = await ConversationService.sendMessage(
        req.params.id,
        req.user!.id,
        req.body,
      );
      ApiResponseUtil.success(res, 'Message sent and processed', result, 201);
    } catch (err) {
      next(err);
    }
  }

  public static async streamMessage(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      await ConversationService.streamMessage(
        req.params.id,
        req.user!.id,
        req.body,
        res,
      );
    } catch (err) {
      next(err);
    }
  }
}
