import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export type CurrentUserPayload = {
  email?: string | null;
  id: string; // ID local (Prisma User.id)
  imageUrl?: string | null;
  clerkUserId: string;
  role: 'ADMIN' | 'SUPERVISOR' | 'TECH';
  name?: string | null;
  isActive: boolean;
};

export const CurrentUser = createParamDecorator(
  (_: unknown, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest<{
      user?: CurrentUserPayload;
    }>();
    return req.user as CurrentUserPayload;
  },
);
