ALTER TABLE "ServiceOrder"
DROP CONSTRAINT "ServiceOrder_createdById_fkey";

ALTER TABLE "ServiceOrder"
DROP CONSTRAINT "ServiceOrder_assignedToId_fkey";

ALTER TABLE "ServiceOrder"
ALTER COLUMN "createdById" DROP NOT NULL,
ADD COLUMN "createdByName" TEXT,
ADD COLUMN "createdByEmail" TEXT,
ADD COLUMN "assignedToName" TEXT,
ADD COLUMN "assignedToEmail" TEXT;
