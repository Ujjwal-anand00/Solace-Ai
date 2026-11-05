import { Router } from 'express';
import { requireAuth } from '../../middlewares/auth.middleware';
import { validateBody } from '../../validators/auth.validator';
import {
  createConversationSchema,
  updateConversationSchema,
  sendMessageSchema,
} from './conversation.validator';
import { ConversationController } from './conversation.controller';

const router = Router();

// Private: All conversation routes require authentication
router.use(requireAuth);

router.post('/', validateBody(createConversationSchema), ConversationController.create);
router.get('/', ConversationController.list);
router.get('/:id', ConversationController.getById);
router.patch('/:id', validateBody(updateConversationSchema), ConversationController.update);
router.delete('/:id', ConversationController.delete);

// Message operations
router.get('/:id/messages', ConversationController.getMessages);
router.post('/:id/messages', validateBody(sendMessageSchema), ConversationController.sendMessage);
router.post('/:id/messages/stream', validateBody(sendMessageSchema), ConversationController.streamMessage);

export const conversationRoutes = router;
