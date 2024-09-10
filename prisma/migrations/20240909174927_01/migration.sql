-- CreateTable
CREATE TABLE "TVL" (
    "id" UUID NOT NULL,
    "token" TEXT NOT NULL,
    "amount" BIGINT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TVL_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "USDRecords" (
    "id" UUID NOT NULL,
    "record" TEXT NOT NULL,
    "amount" DECIMAL(63,2) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "USDRecords_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LockerData" (
    "id" UUID NOT NULL,
    "tokenAddress" TEXT NOT NULL,
    "tokenName" TEXT,
    "tokenImg" TEXT,
    "tokenSymbol" TEXT,
    "count" INTEGER NOT NULL,

    CONSTRAINT "LockerData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DexFees" (
    "id" UUID NOT NULL,
    "token" TEXT NOT NULL,
    "amount" DECIMAL(63,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DexFees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LockerFees" (
    "id" UUID NOT NULL,
    "token" TEXT NOT NULL,
    "amount" DECIMAL(63,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LockerFees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LaunchpadFees" (
    "id" UUID NOT NULL,
    "token" TEXT NOT NULL,
    "amount" DECIMAL(63,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LaunchpadFees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PoolFees" (
    "id" UUID NOT NULL,
    "token" TEXT NOT NULL,
    "amount" DECIMAL(63,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PoolFees_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TVL_token_key" ON "TVL"("token");

-- CreateIndex
CREATE UNIQUE INDEX "USDRecords_record_key" ON "USDRecords"("record");

-- CreateIndex
CREATE UNIQUE INDEX "LockerData_tokenAddress_key" ON "LockerData"("tokenAddress");

-- CreateIndex
CREATE UNIQUE INDEX "DexFees_token_key" ON "DexFees"("token");

-- CreateIndex
CREATE UNIQUE INDEX "LockerFees_token_key" ON "LockerFees"("token");

-- CreateIndex
CREATE UNIQUE INDEX "LaunchpadFees_token_key" ON "LaunchpadFees"("token");

-- CreateIndex
CREATE UNIQUE INDEX "PoolFees_token_key" ON "PoolFees"("token");
