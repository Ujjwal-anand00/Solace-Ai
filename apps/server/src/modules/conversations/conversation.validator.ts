import { z } from 'zod';

export const createConversationSchema = z.object({
  title: z.string().max(120, 'Title cannot exceed 120 characters').trim().optional(),
  initialMessage: z.string().min(1, 'Initial message cannot be empty').max(3000, 'Message cannot exceed 3000 characters').trim().optional(),
});

export const updateConversationSchema = z.object({
  title: z.string().min(1, 'Title cannot be empty').max(120, 'Title cannot exceed 120 characters').trim().optional(),
  status: z.enum(['active', 'archived', 'closed']).optional(),
});

export const sendMessageSchema = z.object({
  content: z.string().min(1, 'Message content cannot be empty').max(3000, 'Message cannot exceed 3000 characters').trim(),
});
