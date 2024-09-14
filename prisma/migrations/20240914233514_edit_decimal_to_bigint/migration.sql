/*
  Warnings:

  - You are about to alter the column `amount` on the `CommunityPoolVolume` table. The data in that column could be lost. The data in that column will be cast from `Decimal(63,0)` to `BigInt`.
  - You are about to alter the column `amount` on the `DexFees` table. The data in that column could be lost. The data in that column will be cast from `Decimal(63,0)` to `BigInt`.
  - You are about to alter the column `amount` on the `DexVolume` table. The data in that column could be lost. The data in that column will be cast from `Decimal(63,0)` to `BigInt`.
  - You are about to alter the column `amount` on the `GamesVolume` table. The data in that column could be lost. The data in that column will be cast from `Decimal(63,0)` to `BigInt`.
  - You are about to alter the column `amount` on the `LaunchpadFees` table. The data in that column could be lost. The data in that column will be cast from `Decimal(63,0)` to `BigInt`.
  - You are about to alter the column `amount` on the `LaunchpadVolume` table. The data in that column could be lost. The data in that column will be cast from `Decimal(63,0)` to `BigInt`.
  - You are about to alter the column `amount` on the `LockerFees` table. The data in that column could be lost. The data in that column will be cast from `Decimal(63,0)` to `BigInt`.
  - You are about to alter the column `amount` on the `LockerVolume` table. The data in that column could be lost. The data in that column will be cast from `Decimal(63,0)` to `BigInt`.
  - You are about to alter the column `amount` on the `MemegoatVolume` table. The data in that column could be lost. The data in that column will be cast from `Decimal(63,0)` to `BigInt`.
  - You are about to alter the column `amount` on the `PoolFees` table. The data in that column could be lost. The data in that column will be cast from `Decimal(63,0)` to `BigInt`.
  - You are about to alter the column `amount` on the `TVL` table. The data in that column could be lost. The data in that column will be cast from `Decimal(63,0)` to `BigInt`.
  - You are about to alter the column `amount` on the `USDRecords` table. The data in that column could be lost. The data in that column will be cast from `Decimal(63,0)` to `BigInt`.

*/
-- AlterTable
ALTER TABLE "CommunityPoolVolume" ALTER COLUMN "amount" SET DATA TYPE BIGINT;

-- AlterTable
ALTER TABLE "DexFees" ALTER COLUMN "amount" SET DATA TYPE BIGINT;

-- AlterTable
ALTER TABLE "DexVolume" ALTER COLUMN "amount" SET DATA TYPE BIGINT;

-- AlterTable
ALTER TABLE "GamesVolume" ALTER COLUMN "amount" SET DATA TYPE BIGINT;

-- AlterTable
ALTER TABLE "LaunchpadFees" ALTER COLUMN "amount" SET DATA TYPE BIGINT;

-- AlterTable
ALTER TABLE "LaunchpadVolume" ALTER COLUMN "amount" SET DATA TYPE BIGINT;

-- AlterTable
ALTER TABLE "LockerFees" ALTER COLUMN "amount" SET DATA TYPE BIGINT;

-- AlterTable
ALTER TABLE "LockerVolume" ALTER COLUMN "amount" SET DATA TYPE BIGINT;

-- AlterTable
ALTER TABLE "MemegoatVolume" ALTER COLUMN "amount" SET DATA TYPE BIGINT;

-- AlterTable
ALTER TABLE "PoolFees" ALTER COLUMN "amount" SET DATA TYPE BIGINT;

-- AlterTable
ALTER TABLE "TVL" ALTER COLUMN "amount" SET DATA TYPE BIGINT;

-- AlterTable
ALTER TABLE "USDRecords" ALTER COLUMN "amount" SET DATA TYPE BIGINT;
