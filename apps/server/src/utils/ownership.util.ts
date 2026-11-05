import { Types } from 'mongoose';
import { AppError } from './apiError';

/**
 * Validates that the requested resource belongs to the authenticated user.
 * Throws 403 Forbidden if user IDs do not match.
 */
export const assertOwnership = (
  resourceUserId: string | Types.ObjectId,
  authenticatedUserId: string,
  resourceName = 'resource',
): void => {
  const resourceOwnerStr = resourceUserId.toString();
  if (resourceOwnerStr !== authenticatedUserId) {
    throw AppError.forbidden(`You do not have permission to access or modify this ${resourceName}.`);
  }
};

