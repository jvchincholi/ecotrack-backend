import { SetMetadata } from '@nestjs/common';

/**
 * Decorator to mark endpoints as public (no JWT required)
 * Usage: @Public() on controller methods
 */
export const Public = () => SetMetadata('isPublic', true);
