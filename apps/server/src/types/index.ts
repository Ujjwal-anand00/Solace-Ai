import { Request } from 'express';
import { AuthTokenPayload } from '@solace/shared';

/**
 * Extended Express Request with authenticated user payload
 */
export interface AuthenticatedRequest extends Request {
  user?: AuthTokenPayload;
}
