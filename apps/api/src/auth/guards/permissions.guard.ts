import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { CurrentUserData } from '../types/auth-jwtPayload';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!required || required.length === 0) return true;

    const user: CurrentUserData = context.switchToHttp().getRequest().user;
    const granted = new Set(user?.permissions ?? []);
    const ok = required.every((p) => granted.has(p));
    if (!ok) throw new ForbiddenException('Insufficient permissions');
    return true;
  }
}
