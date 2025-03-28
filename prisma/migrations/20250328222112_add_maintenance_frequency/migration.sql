/*
  Warnings:

  - You are about to drop the column `acquisitionDate` on the `Vehicle` table. All the data in the column will be lost.
  - You are about to drop the column `lastMaintenanceDone` on the `Vehicle` table. All the data in the column will be lost.
  - You are about to drop the column `lastTechnicalCheck` on the `Vehicle` table. All the data in the column will be lost.
  - You are about to drop the column `mileage` on the `Vehicle` table. All the data in the column will be lost.
  - You are about to drop the column `nextTechnicalCheck` on the `Vehicle` table. All the data in the column will be lost.
  - You are about to drop the column `productionDate` on the `Vehicle` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId,licensePlate]` on the table `Vehicle` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `energyType` on the `Vehicle` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Made the column `vin` on table `Vehicle` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "Vehicle_licensePlate_key";

-- DropIndex
DROP INDEX "Vehicle_vin_key";

-- AlterTable
ALTER TABLE "Vehicle" DROP COLUMN "acquisitionDate",
DROP COLUMN "lastMaintenanceDone",
DROP COLUMN "lastTechnicalCheck",
DROP COLUMN "mileage",
DROP COLUMN "nextTechnicalCheck",
DROP COLUMN "productionDate",
DROP COLUMN "energyType",
ADD COLUMN     "energyType" TEXT NOT NULL,
ALTER COLUMN "vin" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Vehicle_userId_licensePlate_key" ON "Vehicle"("userId", "licensePlate");
