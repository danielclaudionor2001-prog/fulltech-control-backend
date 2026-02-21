-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'TECH');

-- CreateEnum
CREATE TYPE "ServiceOrderType" AS ENUM ('instalacao', 'manutencao', 'vistoria', 'suporte');

-- CreateEnum
CREATE TYPE "ServiceOrderDeadline" AS ENUM ('sem_prazo', 'D1_dia', 'D3_dias', 'D7_dias', 'D15_dias', 'D30_dias');

-- CreateEnum
CREATE TYPE "ServiceOrderStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'DONE', 'CANCELED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "clerkUserId" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'TECH',
    "name" TEXT,
    "imageUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceOrder" (
    "id" TEXT NOT NULL,
    "identifier" TEXT,
    "osType" "ServiceOrderType" NOT NULL,
    "deadline" "ServiceOrderDeadline",
    "customer" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "durationMinutes" INTEGER NOT NULL,
    "scheduleAt" TIMESTAMP(3) NOT NULL,
    "scheduleTimeText" TEXT,
    "collaborator" TEXT,
    "address" TEXT,
    "status" "ServiceOrderStatus" NOT NULL DEFAULT 'OPEN',
    "createdById" TEXT NOT NULL,
    "assignedToId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServiceOrder_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_clerkUserId_key" ON "User"("clerkUserId");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceOrder_identifier_key" ON "ServiceOrder"("identifier");

-- CreateIndex
CREATE INDEX "ServiceOrder_createdById_idx" ON "ServiceOrder"("createdById");

-- CreateIndex
CREATE INDEX "ServiceOrder_assignedToId_idx" ON "ServiceOrder"("assignedToId");

-- CreateIndex
CREATE INDEX "ServiceOrder_status_idx" ON "ServiceOrder"("status");

-- CreateIndex
CREATE INDEX "ServiceOrder_scheduleAt_idx" ON "ServiceOrder"("scheduleAt");

-- AddForeignKey
ALTER TABLE "ServiceOrder" ADD CONSTRAINT "ServiceOrder_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceOrder" ADD CONSTRAINT "ServiceOrder_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
