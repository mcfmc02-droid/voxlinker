/*
  Warnings:

  - Added the required column `clickDbId` to the `Conversion` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Conversion" DROP CONSTRAINT "Conversion_clickId_fkey";

-- AlterTable
ALTER TABLE "Conversion" ADD COLUMN     "clickDbId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Conversion" ADD CONSTRAINT "Conversion_clickDbId_fkey" FOREIGN KEY ("clickDbId") REFERENCES "Click"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
