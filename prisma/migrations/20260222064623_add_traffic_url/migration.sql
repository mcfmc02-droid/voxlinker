-- AlterTable
ALTER TABLE "User" ADD COLUMN     "trafficSourceUrl" TEXT,
ALTER COLUMN "role" SET DEFAULT 'AFFILIATE';
