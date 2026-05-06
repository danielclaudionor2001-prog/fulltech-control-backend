"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClerkAuthGuard = void 0;
const common_1 = require("@nestjs/common");
const backend_1 = require("@clerk/backend");
const prisma_service_1 = require("../../prisma/prisma.service");
let ClerkAuthGuard = class ClerkAuthGuard {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    getBearerToken(authHeader) {
        if (!authHeader)
            throw new common_1.UnauthorizedException('Missing Authorization header');
        const [type, token] = authHeader.split(' ');
        if (type !== 'Bearer' || !token) {
            throw new common_1.UnauthorizedException('Invalid Authorization header');
        }
        return token;
    }
    async canActivate(ctx) {
        const req = ctx.switchToHttp().getRequest();
        const token = this.getBearerToken(req.headers.authorization);
        let payload;
        try {
            payload = await (0, backend_1.verifyToken)(token, {
                secretKey: process.env.CLERK_SECRET_KEY,
            });
        }
        catch {
            throw new common_1.UnauthorizedException('Invalid Clerk token');
        }
        const clerkUserId = payload?.sub;
        if (!clerkUserId)
            throw new common_1.UnauthorizedException('Token without subject');
        const firstName = payload?.first_name;
        const lastName = payload?.last_name;
        const fullName = [firstName, lastName].filter(Boolean).join(' ') || undefined;
        const imageUrl = payload?.image_url ?? undefined;
        const localUser = await this.prisma.user.upsert({
            where: { clerkUserId },
            update: {
                name: fullName ?? undefined,
                imageUrl: imageUrl ?? undefined,
            },
            create: {
                clerkUserId,
                role: 'TECH',
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
            throw new common_1.ForbiddenException('User is inactive');
        }
        req.user = localUser;
        return true;
    }
};
exports.ClerkAuthGuard = ClerkAuthGuard;
exports.ClerkAuthGuard = ClerkAuthGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ClerkAuthGuard);
//# sourceMappingURL=auth.guard.js.map