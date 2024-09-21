-- CreateEnum
CREATE TYPE "CAType" AS ENUM ('Parent', 'Child');

-- CreateTable
CREATE TABLE "LockerContractsV2" (
    "id" UUID NOT NULL,
    "contractAddress" TEXT NOT NULL,
    "tokenAddress" TEXT NOT NULL,
    "user" TEXT NOT NULL,
    "txId" TEXT NOT NULL,
    "type" "CAType" NOT NULL,
    "tokenName" TEXT,
    "tokenImg" TEXT,
    "tokenSymbol" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LockerContractsV2_pkey" PRIMARY KEY ("id")
);
