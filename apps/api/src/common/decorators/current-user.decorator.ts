import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { CurrentUserData } from '../../auth/types/auth-jwtPayload';

/**
 * Injects the authenticated user (or one of its properties) into a handler.
 * @example getProfile(@CurrentUser() user: CurrentUserData) {}
 * @example getId(@CurrentUser('id') id: number) {}
 */
export const CurrentUser = createParamDecorator(
  (data: keyof CurrentUserData | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user: CurrentUserData = request.user;
    return data ? user?.[data] : user;
  },
);
