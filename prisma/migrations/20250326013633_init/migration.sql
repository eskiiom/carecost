/*
  Warnings:

  - A unique constraint covering the columns `[vin]` on the table `Vehicle` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `year` to the `Vehicle` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "MaintenanceFrequency" ADD VALUE 'EVERY_30000KM';

-- AlterTable
ALTER TABLE "Vehicle" ADD COLUMN     "mileage" INTEGER,
ADD COLUMN     "vin" TEXT,
ADD COLUMN     "year" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Vehicle_vin_key" ON "Vehicle"("vin");
