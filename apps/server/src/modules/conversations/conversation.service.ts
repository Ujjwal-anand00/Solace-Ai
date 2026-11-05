import { Types } from 'mongoose';
import { Response } from 'express';
import {
  Conversation,
  ChatMessage,
  CreateConversationDto,
  UpdateConversationDto,
  SendMessageDto,
  SendMessageResponse,
  PaginationMeta,
} from '@solace/shared';
import { ConversationModel } from './conversation.model';
import { ChatMessageModel } from '../companion/chatMessage.model';
import { CompanionService } from '../companion/companion.service';
import { AppError } from '../../utils/apiError';
import { assertOwnership } from '../../utils/ownership.util';
import { parsePagination, buildPaginationMeta } from '../../utils/pagination.util';
import { logger } from '../../utils/logger';

export class ConversationService {
  /**
   * Create a new conversation and optionally handle an initial message.
   */
  public static async createConversation(
    userId: string,
    dto: CreateConversationDto,
  ): Promise<{
    conversation: Conversation;
    userMessage?: ChatMessage;
    assistantMessage?: ChatMessage;
  }> {
    const userObjectId = new Types.ObjectId(userId);

    let title = dto.title?.trim();
    if (!title && dto.initialMessage?.trim()) {
      const words = dto.initialMessage.trim().split(/\s+/).slice(0, 6).join(' ');
      title = words.length > 50 ? words.slice(0, 47) + '...' : words;
    }
    if (!title) {
      title = 'New Conversation';
    }

    const conversation = await ConversationModel.create({
      userId: userObjectId,
      title,
      status: 'active',
      lastMessageAt: new Date(),
    });

    let userMessage: ChatMessage | undefined;
    let assistantMessage: ChatMessage | undefined;

    if (dto.initialMessage?.trim()) {
      const initialUserMsg = await ChatMessageModel.create({
        conversationId: conversation._id,
        userId: userObjectId,
        role: 'user',
        content: dto.initialMessage.trim(),
      });
      userMessage = initialUserMsg.toDto();

      const aiResponse = await CompanionService.generateResponse(
        userId,
        dto.initialMessage.trim(),
        [],
      );

      const initialAiMsg = await ChatMessageModel.create({
        conversationId: conversation._id,
        userId: userObjectId,
        role: 'assistant',
        content: aiResponse.content,
        metadata: {
          ...aiResponse.metadata,
          ...(aiResponse.safetyAlert && { safetyAlert: aiResponse.safetyAlert }),
        },
      });
      assistantMessage = initialAiMsg.toDto();

      conversation.lastMessageAt = new Date();
      await conversation.save();
    }

    return {
      conversation: conversation.toDto(),
      userMessage,
      assistantMessage,
    };
  }

  /**
   * List conversations for the authenticated user (paginated).
   */
  public static async getConversations(
    userId: string,
    rawPage?: unknown,
    rawLimit?: unknown,
  ): Promise<{ data: Conversation[]; pagination: PaginationMeta }> {
    const userObjectId = new Types.ObjectId(userId);
    const { page, limit, skip } = parsePagination(rawPage, rawLimit, 20);

    const [conversations, total] = await Promise.all([
      ConversationModel.find({ userId: userObjectId })
        .sort({ lastMessageAt: -1 })
        .skip(skip)
        .limit(limit),
      ConversationModel.countDocuments({ userId: userObjectId }),
    ]);

    const data = conversations.map((c) => c.toDto());
    const pagination = buildPaginationMeta(total, page, limit);

    return { data, pagination };
  }

  /**
   * Retrieve a conversation by ID, asserting ownership.
   */
  public static async getConversationById(id: string, userId: string): Promise<Conversation> {
    if (!Types.ObjectId.isValid(id)) {
      throw AppError.badRequest('Invalid conversation ID format');
    }

    const conversation = await ConversationModel.findById(id);
    if (!conversation) {
      throw AppError.notFound('Conversation not found');
    }

    assertOwnership(conversation.userId, userId, 'conversation');
    return conversation.toDto();
  }

  /**
   * Update conversation title or status.
   */
  public static async updateConversation(
    id: string,
    userId: string,
    dto: UpdateConversationDto,
  ): Promise<Conversation> {
    if (!Types.ObjectId.isValid(id)) {
      throw AppError.badRequest('Invalid conversation ID format');
    }

    const conversation = await ConversationModel.findById(id);
    if (!conversation) {
      throw AppError.notFound('Conversation not found');
    }

    assertOwnership(conversation.userId, userId, 'conversation');

    if (dto.title !== undefined) {
      conversation.title = dto.title.trim() || 'Untitled Conversation';
    }
    if (dto.status !== undefined) {
      conversation.status = dto.status;
    }

    await conversation.save();
    return conversation.toDto();
  }

  /**
   * Delete a conversation and all its messages.
   */
  public static async deleteConversation(
    id: string,
    userId: string,
  ): Promise<{ success: boolean; message: string }> {
    if (!Types.ObjectId.isValid(id)) {
      throw AppError.badRequest('Invalid conversation ID format');
    }

    const conversation = await ConversationModel.findById(id);
    if (!conversation) {
      throw AppError.notFound('Conversation not found');
    }

    assertOwnership(conversation.userId, userId, 'conversation');

    await Promise.all([
      ConversationModel.findByIdAndDelete(id),
      ChatMessageModel.deleteMany({ conversationId: new Types.ObjectId(id) }),
    ]);

    return {
      success: true,
      message: 'Conversation and all associated messages deleted successfully',
    };
  }

  /**
   * Retrieve messages for a conversation (paginated, chronological).
   */
  public static async getMessages(
    conversationId: string,
    userId: string,
    rawPage?: unknown,
    rawLimit?: unknown,
  ): Promise<{ data: ChatMessage[]; pagination: PaginationMeta }> {
    if (!Types.ObjectId.isValid(conversationId)) {
      throw AppError.badRequest('Invalid conversation ID format');
    }

    const conversation = await ConversationModel.findById(conversationId);
    if (!conversation) {
      throw AppError.notFound('Conversation not found');
    }

    assertOwnership(conversation.userId, userId, 'conversation');

    const { page, limit, skip } = parsePagination(rawPage, rawLimit, 50);

    const [messages, total] = await Promise.all([
      ChatMessageModel.find({ conversationId: new Types.ObjectId(conversationId) })
        .sort({ createdAt: 1 })
        .skip(skip)
        .limit(limit),
      ChatMessageModel.countDocuments({ conversationId: new Types.ObjectId(conversationId) }),
    ]);

    const data = messages.map((m) => m.toDto());
    const pagination = buildPaginationMeta(total, page, limit);

    return { data, pagination };
  }

  /**
   * Send a user message and receive an AI assistant response.
   */
  public static async sendMessage(
    conversationId: string,
    userId: string,
    dto: SendMessageDto,
  ): Promise<SendMessageResponse> {
    if (!Types.ObjectId.isValid(conversationId)) {
      throw AppError.badRequest('Invalid conversation ID format');
    }

    const conversation = await ConversationModel.findById(conversationId);
    if (!conversation) {
      throw AppError.notFound('Conversation not found');
    }

    assertOwnership(conversation.userId, userId, 'conversation');

    const userObjectId = new Types.ObjectId(userId);
    const content = dto.content.trim();

    // 1. Save user message
    const userMsg = await ChatMessageModel.create({
      conversationId: conversation._id,
      userId: userObjectId,
      role: 'user',
      content,
    });

    // 2. Fetch recent conversation history
    const historyDocs = await ChatMessageModel.find({
      conversationId: conversation._id,
      _id: { $ne: userMsg._id },
    })
      .sort({ createdAt: 1 })
      .limit(20);

    const history = historyDocs.map((m) => m.toDto());

    // 3. Update title if it's default
    if (conversation.title === 'New Conversation' || conversation.title === 'Untitled Conversation') {
      const words = content.split(/\s+/).slice(0, 6).join(' ');
      conversation.title = words.length > 50 ? words.slice(0, 47) + '...' : words;
    }

    // 4. Generate AI response
    const aiResult = await CompanionService.generateResponse(userId, content, history);

    // 5. Save assistant message
    const assistantMsg = await ChatMessageModel.create({
      conversationId: conversation._id,
      userId: userObjectId,
      role: 'assistant',
      content: aiResult.content,
      metadata: {
        ...aiResult.metadata,
        ...(aiResult.safetyAlert && { safetyAlert: aiResult.safetyAlert }),
      },
    });

    conversation.lastMessageAt = new Date();
    await conversation.save();

    return {
      userMessage: userMsg.toDto(),
      assistantMessage: assistantMsg.toDto(),
      safetyAlert: aiResult.safetyAlert,
    };
  }

  /**
   * Stream assistant response using Server-Sent Events (SSE).
   */
  public static async streamMessage(
    conversationId: string,
    userId: string,
    dto: SendMessageDto,
    res: Response,
  ): Promise<void> {
    if (!Types.ObjectId.isValid(conversationId)) {
      res.status(400).json({ error: 'Invalid conversation ID format' });
      return;
    }

    const conversation = await ConversationModel.findById(conversationId);
    if (!conversation) {
      res.status(404).json({ error: 'Conversation not found' });
      return;
    }

    try {
      assertOwnership(conversation.userId, userId, 'conversation');
    } catch {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    const userObjectId = new Types.ObjectId(userId);
    const content = dto.content.trim();

    // Initialize SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    // 1. Save user message
    const userMsg = await ChatMessageModel.create({
      conversationId: conversation._id,
      userId: userObjectId,
      role: 'user',
      content,
    });

    res.write(`data: ${JSON.stringify({ type: 'user_message', data: userMsg.toDto() })}\n\n`);

    // 2. Fetch history
    const historyDocs = await ChatMessageModel.find({
      conversationId: conversation._id,
      _id: { $ne: userMsg._id },
    })
      .sort({ createdAt: 1 })
      .limit(20);

    const history = historyDocs.map((m) => m.toDto());

    // 3. Update title if needed
    if (conversation.title === 'New Conversation' || conversation.title === 'Untitled Conversation') {
      const words = content.split(/\s+/).slice(0, 6).join(' ');
      conversation.title = words.length > 50 ? words.slice(0, 47) + '...' : words;
    }

    try {
      // 4. Stream chunks
      const aiResult = await CompanionService.generateStreamingResponse(
        userId,
        content,
        history,
        (chunk: string) => {
          res.write(`data: ${JSON.stringify({ type: 'chunk', data: { chunk } })}\n\n`);
        },
      );

      // 5. Save final assistant message
      const assistantMsg = await ChatMessageModel.create({
        conversationId: conversation._id,
        userId: userObjectId,
        role: 'assistant',
        content: aiResult.fullContent,
        metadata: {
          ...aiResult.metadata,
          ...(aiResult.safetyAlert && { safetyAlert: aiResult.safetyAlert }),
        },
      });

      conversation.lastMessageAt = new Date();
      await conversation.save();

      res.write(
        `data: ${JSON.stringify({
          type: 'assistant_message',
          data: assistantMsg.toDto(),
          safetyAlert: aiResult.safetyAlert,
        })}\n\n`,
      );
      res.write('data: [DONE]\n\n');
      res.end();
    } catch (streamError) {
      logger.error('Error during SSE stream:', streamError);
      res.write(
        `data: ${JSON.stringify({
          type: 'error',
          data: { message: 'Stream interrupted unexpectedly' },
        })}\n\n`,
      );
      res.end();
    }
  }
}

