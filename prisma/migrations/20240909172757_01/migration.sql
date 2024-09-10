-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "profileId" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "avatar" TEXT,
    "smartKey" TEXT NOT NULL,
    "useRef" BOOLEAN NOT NULL DEFAULT false,
    "refPoint" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tweet" (
    "id" UUID NOT NULL,
    "postId" TEXT NOT NULL,
    "postedAt" TIMESTAMP(3),
    "like" INTEGER NOT NULL DEFAULT 0,
    "reply" INTEGER NOT NULL DEFAULT 0,
    "quote" INTEGER NOT NULL DEFAULT 0,
    "retweet" INTEGER NOT NULL DEFAULT 0,
    "impression" INTEGER NOT NULL DEFAULT 0,
    "referenced" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" UUID NOT NULL,

    CONSTRAINT "Tweet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reward" (
    "id" UUID NOT NULL,
    "earn" DOUBLE PRECISION NOT NULL DEFAULT 0.00,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" UUID NOT NULL,

    CONSTRAINT "Reward_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Settings" (
    "id" UUID NOT NULL,
    "profileId" TEXT NOT NULL DEFAULT '1765374788577398784',
    "hasTurnedOffCampaign" BOOLEAN NOT NULL DEFAULT false,
    "campaignedAt" TIMESTAMP(3),
    "days" INTEGER NOT NULL DEFAULT 7,
    "tags" TEXT[],
    "point" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Admin" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Task" (
    "id" UUID NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CampaignRequest" (
    "id" UUID NOT NULL,
    "step" TEXT,
    "tx_id" TEXT,
    "tx_status" TEXT,
    "action" TEXT,
    "user_addr" TEXT,
    "token_image" TEXT,
    "token_name" TEXT,
    "token_desc" TEXT,
    "token_supply" TEXT,
    "token_ticker" TEXT,
    "token_address" TEXT NOT NULL,
    "token_website" TEXT,
    "twitter" TEXT,
    "discord" TEXT,
    "campaign_allocation" TEXT,
    "campaign_description" TEXT,
    "campaign_twitter" TEXT,
    "campaign_hashtags" TEXT,
    "listing_allocation" TEXT,
    "sale_allocation" TEXT,
    "sale_description" TEXT,
    "hard_cap" TEXT,
    "soft_cap" TEXT,
    "maximum_buy" TEXT,
    "minimum_buy" TEXT,
    "is_campaign" BOOLEAN NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CampaignRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MintedToken" (
    "id" UUID NOT NULL,
    "token_image" TEXT,
    "token_name" TEXT,
    "token_desc" TEXT,
    "token_supply" TEXT,
    "token_ticker" TEXT,
    "token_address" TEXT NOT NULL,
    "user_addr" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MintedToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WaitList" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,

    CONSTRAINT "WaitList_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AlexTokens" (
    "id" UUID NOT NULL,
    "tokenId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "wrapTokenDecimals" INTEGER NOT NULL,
    "wrapToken" TEXT NOT NULL,
    "underlyingToken" TEXT NOT NULL,
    "underlyingTokenDecimals" INTEGER NOT NULL,
    "isRebaseToken" BOOLEAN NOT NULL,

    CONSTRAINT "AlexTokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AllTokens" (
    "id" UUID NOT NULL,
    "symbol" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "decimals" INTEGER NOT NULL,

    CONSTRAINT "AllTokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VelarTokens" (
    "id" UUID NOT NULL,
    "symbol" TEXT NOT NULL,

    CONSTRAINT "VelarTokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MemegoatVolume" (
    "id" UUID NOT NULL,
    "token" TEXT NOT NULL,
    "amount" DECIMAL(63,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MemegoatVolume_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommunityPoolVolume" (
    "id" UUID NOT NULL,
    "token" TEXT NOT NULL,
    "amount" DECIMAL(63,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CommunityPoolVolume_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LockerVolume" (
    "id" UUID NOT NULL,
    "token" TEXT NOT NULL,
    "amount" DECIMAL(63,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LockerVolume_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DexVolume" (
    "id" UUID NOT NULL,
    "token" TEXT NOT NULL,
    "amount" DECIMAL(63,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DexVolume_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LaunchpadVolume" (
    "id" UUID NOT NULL,
    "token" TEXT NOT NULL,
    "amount" DECIMAL(63,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LaunchpadVolume_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GamesVolume" (
    "id" UUID NOT NULL,
    "token" TEXT NOT NULL,
    "amount" DECIMAL(63,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GamesVolume_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContractOffsets" (
    "id" UUID NOT NULL,
    "contract" TEXT NOT NULL,
    "nextOffset" INTEGER NOT NULL,
    "totalTransactions" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContractOffsets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_profileId_key" ON "User"("profileId");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_smartKey_key" ON "User"("smartKey");

-- CreateIndex
CREATE INDEX "User_username_idx" ON "User"("username");

-- CreateIndex
CREATE INDEX "User_displayName_idx" ON "User"("displayName");

-- CreateIndex
CREATE INDEX "User_createdAt_updatedAt_idx" ON "User"("createdAt", "updatedAt");

-- CreateIndex
CREATE INDEX "Tweet_createdAt_updatedAt_idx" ON "Tweet"("createdAt", "updatedAt");

-- CreateIndex
CREATE INDEX "Tweet_like_reply_quote_retweet_impression_idx" ON "Tweet"("like", "reply", "quote", "retweet", "impression");

-- CreateIndex
CREATE UNIQUE INDEX "Tweet_postId_userId_key" ON "Tweet"("postId", "userId");

-- CreateIndex
CREATE INDEX "Reward_createdAt_updatedAt_idx" ON "Reward"("createdAt", "updatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_email_key" ON "Admin"("email");

-- CreateIndex
CREATE UNIQUE INDEX "CampaignRequest_token_address_key" ON "CampaignRequest"("token_address");

-- CreateIndex
CREATE UNIQUE INDEX "MintedToken_token_address_key" ON "MintedToken"("token_address");

-- CreateIndex
CREATE UNIQUE INDEX "WaitList_email_key" ON "WaitList"("email");

-- CreateIndex
CREATE UNIQUE INDEX "AlexTokens_tokenId_key" ON "AlexTokens"("tokenId");

-- CreateIndex
CREATE UNIQUE INDEX "AllTokens_address_key" ON "AllTokens"("address");

-- CreateIndex
CREATE INDEX "AllTokens_symbol_idx" ON "AllTokens"("symbol");

-- CreateIndex
CREATE UNIQUE INDEX "VelarTokens_symbol_key" ON "VelarTokens"("symbol");

-- CreateIndex
CREATE UNIQUE INDEX "MemegoatVolume_token_key" ON "MemegoatVolume"("token");

-- CreateIndex
CREATE UNIQUE INDEX "CommunityPoolVolume_token_key" ON "CommunityPoolVolume"("token");

-- CreateIndex
CREATE UNIQUE INDEX "LockerVolume_token_key" ON "LockerVolume"("token");

-- CreateIndex
CREATE UNIQUE INDEX "DexVolume_token_key" ON "DexVolume"("token");

-- CreateIndex
CREATE UNIQUE INDEX "LaunchpadVolume_token_key" ON "LaunchpadVolume"("token");

-- CreateIndex
CREATE UNIQUE INDEX "GamesVolume_token_key" ON "GamesVolume"("token");

-- CreateIndex
CREATE UNIQUE INDEX "ContractOffsets_contract_key" ON "ContractOffsets"("contract");

-- AddForeignKey
ALTER TABLE "Tweet" ADD CONSTRAINT "Tweet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reward" ADD CONSTRAINT "Reward_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
