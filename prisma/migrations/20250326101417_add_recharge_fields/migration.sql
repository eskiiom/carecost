/*
  Warnings:

  - The `stationType` column on the `FuelEntry` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "StationType" AS ENUM ('PUBLIC', 'PRIVATE', 'HOME');

-- CreateEnum
CREATE TYPE "RechargeType" AS ENUM ('FAST', 'NORMAL', 'SLOW');

-- AlterTable
ALTER TABLE "FuelEntry" ADD COLUMN     "isSubscription" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "rechargeType" "RechargeType",
ADD COLUMN     "subscriptionEndDate" TIMESTAMP(3),
ADD COLUMN     "subscriptionStartDate" TIMESTAMP(3),
DROP COLUMN "stationType",
ADD COLUMN     "stationType" "StationType";
