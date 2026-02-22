import {
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { verifyToken } from '@clerk/backend';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ClerkAuthGuard implements CanActivate {
    constructor(private prisma: PrismaService) { }

    private getBearerToken(authHeader?: string): string {
        if (!authHeader) throw new UnauthorizedException('Missing Authorization header');

        const [type, token] = authHeader.split(' ');
        if (type !== 'Bearer' || !token) {
            throw new UnauthorizedException('Invalid Authorization header');
        }

        return token;
    }

    async canActivate(ctx: ExecutionContext): Promise<boolean> {
        const req = ctx.switchToHttp().getRequest();
        const token = this.getBearerToken(req.headers.authorization);

        let payload: any;
        try {
            payload = await verifyToken(token, {
                secretKey: process.env.CLERK_SECRET_KEY!,
            });
        } catch {
            throw new UnauthorizedException('Invalid Clerk token');
        }

        const clerkUserId = payload?.sub as string | undefined;
        if (!clerkUserId) throw new UnauthorizedException('Token without subject');

        // Claims opcionais (podem ou não existir dependendo da config do Clerk)
        const firstName = payload?.first_name as string | undefined;
        const lastName = payload?.last_name as string | undefined;
        const fullName = [firstName, lastName].filter(Boolean).join(' ') || undefined;
        const imageUrl = (payload?.image_url as string | undefined) ?? undefined;

        const localUser = await this.prisma.user.upsert({
            where: { clerkUserId },
            update: {
                name: fullName ?? undefined,
                imageUrl: imageUrl ?? undefined,
            },
            create: {
                clerkUserId,
                role: 'TECH', // padrão (você promove para ADMIN depois)
                name: fullName ?? null,
                imageUrl: imageUrl ?? null,
            },
            select: {
                id: true,
                clerkUserId: true,
                role: true,
                name: true,
                isActive: true,
            },
        });

        if (!localUser.isActive) {
            throw new ForbiddenException('User is inactive');
        }

        req.user = localUser;
        return true;
    }
}