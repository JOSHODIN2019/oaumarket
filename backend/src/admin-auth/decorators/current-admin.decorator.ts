import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { AuthenticatedAdmin } from '../strategies/admin-jwt.strategy.js';

export const CurrentAdmin = createParamDecorator((_: unknown, ctx: ExecutionContext): AuthenticatedAdmin => {
  const request = ctx.switchToHttp().getRequest();
  return request.user;
});
