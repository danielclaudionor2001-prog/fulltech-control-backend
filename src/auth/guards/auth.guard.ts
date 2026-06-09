import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClerkClient, verifyToken } from '@clerk/backend';
import { UserRole } from '../../generated/prisma';
import { PrismaService } from '../../prisma/prisma.service';

type LocalUserPayload = {
  email: string | null;
  id: string;
  imageUrl: string | null;
  isActive: boolean;
  name: string | null;
  role: UserRole;
};

type AuthenticatedRequest = {
  headers: {
    authorization?: string;
  };
  user?: LocalUserPayload & {
    clerkUserId: string;
  };
};

@Injectable()
export class ClerkAuthGuard implements CanActivate {
  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  private get clerkClient() {
    return createClerkClient({
      secretKey: this.config.getOrThrow<string>('CLERK_SECRET_KEY'),
    });
  }

  private getBearerToken(authHeader?: string): string {
    if (!authHeader) {
      throw new UnauthorizedException('Missing Authorization header');
    }

    const [type, token] = authHeader.split(' ');
    if (type !== 'Bearer' || !token) {
      throw new UnauthorizedException('Invalid Authorization header');
    }

    return token;
  }

  private getAdminEmails() {
    return new Set(
      (this.config.get<string>('CLERK_ADMIN_EMAILS') ?? '')
        .split(',')
        .map((email) => email.trim().toLowerCase())
        .filter(Boolean),
    );
  }

  private getFirstAdminEmail() {
    return (
      this.config
        .get<string>('CLERK_FIRST_ADMIN_EMAIL')
        ?.trim()
        .toLowerCase() ?? ''
    );
  }

  private async resolveLocalUser(
    clerkUserId: string,
    email: string,
    name: string | null,
    imageUrl: string | null,
  ): Promise<LocalUserPayload> {
    const normalizedEmail = email.trim().toLowerCase();
    const configuredAdminEmails = this.getAdminEmails();
    const firstAdminEmail = this.getFirstAdminEmail();

    const existingUser = await this.prisma.user.findUnique({
      where: { clerkUserId },
      select: {
        clerkUserId: true,
        email: true,
        id: true,
        imageUrl: true,
        isActive: true,
        name: true,
        role: true,
      },
    });

    const allowedEmailEntry = await this.prisma.allowedEmail.findUnique({
      where: { email: normalizedEmail },
      select: { id: true },
    });

    const shouldBeAdmin =
      normalizedEmail === firstAdminEmail ||
      configuredAdminEmails.has(normalizedEmail) ||
      existingUser?.role === UserRole.ADMIN;
    const isAllowedTechnician = Boolean(allowedEmailEntry);
    const role = shouldBeAdmin
      ? UserRole.ADMIN
      : (existingUser?.role ?? UserRole.TECH);
    const isActive = shouldBeAdmin || isAllowedTechnician;

    return this.prisma.user.upsert({
      where: { clerkUserId },
      update: {
        email: normalizedEmail,
        imageUrl,
        isActive,
        name,
        role,
      },
      create: {
        clerkUserId,
        email: normalizedEmail,
        imageUrl,
        isActive,
        name,
        role,
      },
      select: {
        email: true,
        id: true,
        imageUrl: true,
        isActive: true,
        name: true,
        role: true,
      },
    });
  }

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = this.getBearerToken(req.headers.authorization);
    const clerkSecretKey = this.config.getOrThrow<string>('CLERK_SECRET_KEY');
    const clerkJwtKey = this.config.get<string>('CLERK_JWT_KEY');

    let payload: Record<string, unknown>;
    try {
      payload = await verifyToken(token, {
        jwtKey: clerkJwtKey,
        secretKey: clerkSecretKey,
      });
    } catch {
      throw new UnauthorizedException('Invalid Clerk token');
    }

    const clerkUserId = payload.sub;
    if (typeof clerkUserId !== 'string' || !clerkUserId) {
      throw new UnauthorizedException('Token without subject');
    }

    const clerkUser = await this.clerkClient.users.getUser(clerkUserId);
    const primaryEmail =
      clerkUser.emailAddresses.find(
        (emailAddress) => emailAddress.id === clerkUser.primaryEmailAddressId,
      ) ?? clerkUser.emailAddresses[0];

    if (!primaryEmail?.emailAddress) {
      throw new UnauthorizedException('Clerk user without primary email');
    }

    const fullName =
      [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ') ||
      null;

    const localUser = await this.resolveLocalUser(
      clerkUserId,
      primaryEmail.emailAddress,
      fullName,
      clerkUser.imageUrl ?? null,
    );

    if (!localUser.isActive) {
      throw new ForbiddenException(
        'This email is not authorized to access the application',
      );
    }

    req.user = {
      ...localUser,
      clerkUserId,
    };

    return true;
  }
}
