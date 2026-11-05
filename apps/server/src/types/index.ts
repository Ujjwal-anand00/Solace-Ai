import { Request } from 'express';
import { AuthenticatedUser } from './express';

export * from './express';

/**
 * Extended Express Request with authenticated user payload
 */
export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}
