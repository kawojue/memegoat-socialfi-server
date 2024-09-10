/*
  Warnings:

  - You are about to alter the column `amount` on the `CommunityPoolVolume` table. The data in that column could be lost. The data in that column will be cast from `Decimal(63,2)` to `Decimal(63,0)`.
  - You are about to alter the column `amount` on the `DexFees` table. The data in that column could be lost. The data in that column will be cast from `Decimal(63,2)` to `Decimal(63,0)`.
  - You are about to alter the column `amount` on the `DexVolume` table. The data in that column could be lost. The data in that column will be cast from `Decimal(63,2)` to `Decimal(63,0)`.
  - You are about to alter the column `amount` on the `GamesVolume` table. The data in that column could be lost. The data in that column will be cast from `Decimal(63,2)` to `Decimal(63,0)`.
  - You are about to alter the column `amount` on the `LaunchpadFees` table. The data in that column could be lost. The data in that column will be cast from `Decimal(63,2)` to `Decimal(63,0)`.
  - You are about to alter the column `amount` on the `LaunchpadVolume` table. The data in that column could be lost. The data in that column will be cast from `Decimal(63,2)` to `Decimal(63,0)`.
  - You are about to alter the column `amount` on the `LockerFees` table. The data in that column could be lost. The data in that column will be cast from `Decimal(63,2)` to `Decimal(63,0)`.
  - You are about to alter the column `amount` on the `LockerVolume` table. The data in that column could be lost. The data in that column will be cast from `Decimal(63,2)` to `Decimal(63,0)`.
  - You are about to alter the column `amount` on the `MemegoatVolume` table. The data in that column could be lost. The data in that column will be cast from `Decimal(63,2)` to `Decimal(63,0)`.
  - You are about to alter the column `amount` on the `PoolFees` table. The data in that column could be lost. The data in that column will be cast from `Decimal(63,2)` to `Decimal(63,0)`.
  - You are about to alter the column `amount` on the `USDRecords` table. The data in that column could be lost. The data in that column will be cast from `Decimal(63,2)` to `Decimal(63,0)`.

*/
-- AlterTable
ALTER TABLE "CommunityPoolVolume" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(63,0);

-- AlterTable
ALTER TABLE "DexFees" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(63,0);

-- AlterTable
ALTER TABLE "DexVolume" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(63,0);

-- AlterTable
ALTER TABLE "GamesVolume" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(63,0);

-- AlterTable
ALTER TABLE "LaunchpadFees" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(63,0);

-- AlterTable
ALTER TABLE "LaunchpadVolume" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(63,0);

-- AlterTable
ALTER TABLE "LockerFees" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(63,0);

-- AlterTable
ALTER TABLE "LockerVolume" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(63,0);

-- AlterTable
ALTER TABLE "MemegoatVolume" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(63,0);

-- AlterTable
ALTER TABLE "PoolFees" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(63,0);

-- AlterTable
ALTER TABLE "TVL" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(63,0);

-- AlterTable
ALTER TABLE "USDRecords" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(63,0);
