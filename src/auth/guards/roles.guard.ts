import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CurrentUserPayload } from '../decorators/current-user.decorator';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const roles = this.reflector.getAllAndOverride<
      Array<'ADMIN' | 'SUPERVISOR' | 'TECH'>
    >(
      ROLES_KEY,
      [ctx.getHandler(), ctx.getClass()],
    );

    if (!roles || roles.length === 0) return true;

    const req = ctx.switchToHttp().getRequest<{
      user?: CurrentUserPayload;
    }>();
    const user = req.user;

    return !!user?.role && roles.includes(user.role);
  }
}
