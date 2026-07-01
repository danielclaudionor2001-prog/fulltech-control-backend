import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClerkClient } from '@clerk/backend';
import { UserRole } from '../generated/prisma';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AccessListService {
  private readonly logger = new Logger(AccessListService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  private get clerkClient() {
    return createClerkClient({
      secretKey: this.config.getOrThrow<string>('CLERK_SECRET_KEY'),
    });
  }

  private getFirstAdminEmail() {
    return (
      this.config
        .get<string>('CLERK_FIRST_ADMIN_EMAIL')
        ?.trim()
        .toLowerCase() ?? ''
    );
  }

  private normalizeEmail(email: string) {
    return email.trim().toLowerCase();
  }

  private isProtectedEmail(email: string) {
    const firstAdminEmail = this.getFirstAdminEmail();
    return Boolean(firstAdminEmail) && email === firstAdminEmail;
  }

  private isClerkNotFoundError(error: unknown) {
    return (
      typeof error === 'object' &&
      error !== null &&
      'status' in error &&
      error.status === 404
    );
  }

  private async deleteClerkUsersByEmail(
    email: string,
    localClerkUserIds: string[],
  ) {
    const remoteUsers = await this.clerkClient.users.getUserList({
      emailAddress: [email],
      limit: 100,
    });

    const clerkUserIds = new Set([
      ...remoteUsers.data.map((user) => user.id),
      ...localClerkUserIds.filter(Boolean),
    ]);

    for (const clerkUserId of clerkUserIds) {
      try {
        await this.clerkClient.users.deleteUser(clerkUserId);
      } catch (error) {
        if (this.isClerkNotFoundError(error)) {
          this.logger.warn(
            `Usuário ${clerkUserId} já não existe no Clerk durante remoção de ${email}.`,
          );
          continue;
        }

        throw error;
      }
    }
  }

  async findAll() {
    const firstAdminEmail = this.getFirstAdminEmail();
    const allowedEmails = await this.prisma.allowedEmail.findMany({
      orderBy: [{ role: 'asc' }, { email: 'asc' }],
    });
    const emails = allowedEmails.map((allowedEmail) => allowedEmail.email);
    const users =
      emails.length > 0
        ? await this.prisma.user.findMany({
            where: {
              email: {
                in: emails,
              },
            },
            select: {
              clerkUserId: true,
              email: true,
              id: true,
              imageUrl: true,
              isActive: true,
              name: true,
              role: true,
            },
          })
        : [];
    const usersByEmail = new Map(
      users
        .filter((user) => user.email)
        .map((user) => [user.email?.toLowerCase(), user]),
    );

    return allowedEmails.map((allowedEmail) => ({
      ...allowedEmail,
      isProtected:
        Boolean(firstAdminEmail) && allowedEmail.email === firstAdminEmail,
      user: usersByEmail.get(allowedEmail.email.toLowerCase()) ?? null,
    }));
  }

  async create(email: string, role: UserRole) {
    const normalizedEmail = this.normalizeEmail(email);
    const normalizedRole = this.isProtectedEmail(normalizedEmail)
      ? UserRole.ADMIN
      : role;

    const saved = await this.prisma.allowedEmail.upsert({
      where: { email: normalizedEmail },
      update: { role: normalizedRole },
      create: {
        email: normalizedEmail,
        role: normalizedRole,
      },
    });

    await this.prisma.user.updateMany({
      where: {
        email: normalizedEmail,
      },
      data: {
        isActive: true,
        role: normalizedRole,
      },
    });

    return {
      ...saved,
      isProtected: this.isProtectedEmail(normalizedEmail),
    };
  }

  async remove(id: string) {
    const allowedEmail = await this.prisma.allowedEmail.findUnique({
      where: { id },
    });

    if (!allowedEmail) {
      throw new NotFoundException('E-mail autorizado não encontrado.');
    }

    if (this.isProtectedEmail(allowedEmail.email)) {
      throw new ForbiddenException(
        'Não é possível remover o administrador principal configurado por ambiente.',
      );
    }

    const localUsers = await this.prisma.user.findMany({
      where: {
        email: allowedEmail.email,
      },
      select: {
        clerkUserId: true,
        email: true,
        id: true,
        name: true,
      },
    });

    const localUserIds = localUsers.map((user) => user.id);

    await this.deleteClerkUsersByEmail(
      allowedEmail.email,
      localUsers.map((user) => user.clerkUserId),
    );

    const result = await this.prisma.$transaction(async (tx) => {
      await tx.allowedEmail.delete({
        where: { id },
      });

      if (localUserIds.length > 0) {
        for (const localUser of localUsers) {
          await tx.serviceOrder.updateMany({
            where: {
              createdById: localUser.id,
              OR: [{ createdByEmail: null }, { createdByName: null }],
            },
            data: {
              createdByEmail: localUser.email ?? allowedEmail.email,
              createdByName: localUser.name,
            },
          });

          await tx.serviceOrder.updateMany({
            where: {
              assignedToId: localUser.id,
              OR: [{ assignedToEmail: null }, { assignedToName: null }],
            },
            data: {
              assignedToEmail: localUser.email ?? allowedEmail.email,
              assignedToName: localUser.name,
            },
          });
        }

        const deletedUsers = await tx.user.deleteMany({
          where: {
            id: {
              in: localUserIds,
            },
          },
        });

        return {
          deletedUsersCount: deletedUsers.count,
        };
      }

      return {
        deletedUsersCount: 0,
      };
    });

    return {
      ...result,
      success: true,
    };
  }
}
