-- CreateTable
CREATE TABLE "LockerContracts" (
    "id" UUID NOT NULL,
    "contractAddress" TEXT NOT NULL,
    "tokenAddress" TEXT NOT NULL,
    "creator" TEXT NOT NULL,
    "txId" TEXT NOT NULL,
    "tokenName" TEXT,
    "tokenImg" TEXT,
    "tokenSymbol" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LockerContracts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LockerContracts_contractAddress_key" ON "LockerContracts"("contractAddress");
