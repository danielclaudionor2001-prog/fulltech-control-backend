import { CanActivate, ExecutionContext } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
export declare class ClerkAuthGuard implements CanActivate {
    private prisma;
    constructor(prisma: PrismaService);
    private getBearerToken;
    canActivate(ctx: ExecutionContext): Promise<boolean>;
}
