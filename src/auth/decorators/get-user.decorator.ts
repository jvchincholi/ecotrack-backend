import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Decorator to extract the authenticated user from the request
 * Usage: @GetUser() user: TokenPayloadDto
 */
export const GetUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
