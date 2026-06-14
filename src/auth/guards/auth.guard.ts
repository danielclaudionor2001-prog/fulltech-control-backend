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

  private async ensurePrimaryAdminAccess(email: string) {
    const firstAdminEmail = this.getFirstAdminEmail();

    if (!firstAdminEmail || email !== firstAdminEmail) {
      return;
    }

    await this.prisma.allowedEmail.upsert({
      where: { email },
      update: { role: UserRole.ADMIN },
      create: {
        email,
        role: UserRole.ADMIN,
      },
    });
  }

  private async resolveLocalUser(
    clerkUserId: string,
    email: string,
    name: string | null,
    imageUrl: string | null,
  ): Promise<LocalUserPayload> {
    const normalizedEmail = email.trim().toLowerCase();
    await this.ensurePrimaryAdminAccess(normalizedEmail);

    const configuredAdminEmails = this.getAdminEmails();
    const firstAdminEmail = this.getFirstAdminEmail();

    const userSelect = {
      clerkUserId: true,
      email: true,
      id: true,
      imageUrl: true,
      isActive: true,
      name: true,
      role: true,
    } as const;

    const existingUserByClerkId = await this.prisma.user.findUnique({
      where: { clerkUserId },
      select: userSelect,
    });

    const existingUserByEmail = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: userSelect,
    });

    const allowedEmailEntry = await this.prisma.allowedEmail.findUnique({
      where: { email: normalizedEmail },
      select: { id: true, role: true },
    });

    const shouldBeAdmin =
      normalizedEmail === firstAdminEmail ||
      configuredAdminEmails.has(normalizedEmail) ||
      allowedEmailEntry?.role === UserRole.ADMIN ||
      existingUserByClerkId?.role === UserRole.ADMIN ||
      existingUserByEmail?.role === UserRole.ADMIN;
    const existingUser = existingUserByClerkId ?? existingUserByEmail;
    const role = shouldBeAdmin
      ? UserRole.ADMIN
      : (existingUser?.role ?? allowedEmailEntry?.role ?? UserRole.TECH);
    const isActive = shouldBeAdmin || Boolean(allowedEmailEntry);

    if (
      existingUserByClerkId &&
      existingUserByEmail &&
      existingUserByClerkId.id !== existingUserByEmail.id
    ) {
      throw new ForbiddenException(
        'This email is already linked to another local user',
      );
    }

    if (existingUser) {
      return this.prisma.user.update({
        where: { id: existingUser.id },
        data: {
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

    return this.prisma.user.create({
      data: {
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

    const firstName = clerkUser.firstName?.trim();
    const lastName = clerkUser.lastName?.trim();

    if (!firstName || !lastName) {
      throw new ForbiddenException(
        'Complete first and last name in Clerk before accessing the application',
      );
    }

    const fullName = `${firstName} ${lastName}`;

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
