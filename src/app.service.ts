import { RefDTO } from './dto/ref.dto';
import { ChartDTO } from './dto/chart.dto';
import { Request, Response } from 'express';
import { Injectable } from '@nestjs/common';
import { SmartKeyDTO } from './dto/key.dto';
import { ApiService } from 'lib/api.service';
import { decryptKey } from 'helpers/smartKey';
import { MiscService } from 'lib/misc.service';
import { BalanceDTO } from './dto/balance.dto';
import { StatusCodes } from 'enums/statusCodes';
import { WaitListDTO } from './dto/waitlist.dto';
import { TokenMintDTO } from './dto/token-mint.dto';
import { PrismaService } from 'prisma/prisma.service';
import { ResponseService } from 'lib/response.service';
import { CampaignRequestDTO } from './dto/compaign-req.dto';
import { CloudflareService } from './cloudflare/cloudflare.service';
import { token, TxnVolumeService, txVolumeOutput } from 'lib/txVolume.service';
import { contractDTO, ContractService } from 'lib/contract.service';
import BigNumber from 'bignumber.js';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class AppService {
  constructor(
    private readonly misc: MiscService,
    private readonly prisma: PrismaService,
    private readonly apiService: ApiService,
    private readonly response: ResponseService,
    private readonly cloudflare: CloudflareService,
    private readonly txnVolumeService: TxnVolumeService,
    private readonly contractService: ContractService,
  ) {}

  getHello(): string {
    return 'Memegoat!';
  }

  async leaderboard(res: Response) {
    try {
      const now = new Date();
      const settings = await this.prisma.settings.findFirst();
      const { days, hasTurnedOffCampaign, campaignedAt } = settings;

      if (!campaignedAt || hasTurnedOffCampaign) {
        return this.response.sendSuccess(res, StatusCodes.OK, { data: [] });
      }

      const campaignEndDate = new Date(campaignedAt);
      campaignEndDate.setDate(campaignEndDate.getDate() + days);

      if (now > campaignEndDate) {
        return this.response.sendSuccess(res, StatusCodes.OK, { data: [] });
      }

      const daysAgo = new Date(now);
      daysAgo.setDate(now.getDate() - days);

      const users = await this.prisma.user.findMany({
        where: {
          NOT: [
            { username: { equals: 'devcoinstx', mode: 'insensitive' } },
            { username: { equals: 'goatcoinstx', mode: 'insensitive' } },
          ],
        },
        select: {
          refPoint: true,
          tweets: {
            where: {
              postedAt: {
                gte: daysAgo,
                lte: now,
              },
            },
          },
          avatar: true,
          username: true,
          displayName: true,
        },
      });

      let leaderboardData = [];

      for (const user of users) {
        let impressions = user.refPoint;

        for (const tweet of user.tweets) {
          impressions +=
            tweet.like +
            tweet.retweet +
            tweet.reply +
            tweet.impression +
            tweet.quote;
        }

        if (impressions > 0) {
          leaderboardData.push({
            impressions,
            avatar: user.avatar,
            username: user.username,
            tweets: user.tweets.length,
            displayName: user.displayName,
          });
        }
      }

      leaderboardData.sort((a, b) => b.impressions - a.impressions);

      this.response.sendSuccess(res, StatusCodes.OK, { data: leaderboardData });
    } catch (err) {
      this.misc.handleServerError(
        res,
        err,
        'Something went wrong while generating leaderboard',
      );
    }
  }

  private async info(key: string, fieldName: 'smartKey' | 'profileId') {
    const now = new Date();
    const settings = await this.prisma.settings.findFirst();
    const { days, hasTurnedOffCampaign, campaignedAt } = settings;

    const user = await this.prisma.user.findUnique({
      where: fieldName === 'profileId' ? { profileId: key } : { smartKey: key },
      include: {
        rewards: {
          select: {
            id: true,
            earn: true,
            updatedAt: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!user) return;

    const metadata = {
      views: 0,
      likes: 0,
      quotes: 0,
      replies: 0,
      retweets: 0,
    };

    const tweets = await this.prisma.tweet.findMany({
      where: { userId: user.id },
    });

    const tweetCounts = await this.prisma.tweet.count({
      where: { userId: user.id },
    });

    for (const tweet of tweets) {
      metadata.likes += tweet.like;
      metadata.quotes += tweet.quote;
      metadata.replies += tweet.reply;
      metadata.views += tweet.impression;
      metadata.retweets += tweet.retweet;
    }

    let userRank = null;

    if (!hasTurnedOffCampaign && campaignedAt) {
      const campaignEndDate = new Date(campaignedAt);
      campaignEndDate.setDate(campaignedAt.getDate() + days);

      if (now <= campaignEndDate) {
        const daysAgo = new Date(now);
        daysAgo.setDate(now.getDate() - days);

        const users = await this.prisma.user.findMany({
          where: {
            NOT: [
              { username: { equals: 'devcoinstx', mode: 'insensitive' } },
              { username: { equals: 'goatcoinstx', mode: 'insensitive' } },
            ],
          },
          select: {
            id: true,
            refPoint: true,
            tweets: {
              where: {
                postedAt: {
                  gte: daysAgo,
                  lte: now,
                },
              },
            },
          },
        });

        const leaderboardData = users
          .map((u) => {
            let impressions = u.refPoint;

            for (const tweet of u.tweets) {
              impressions +=
                tweet.like +
                tweet.retweet +
                tweet.reply +
                tweet.impression +
                tweet.quote;
            }

            return {
              id: u.id,
              impressions,
              tweets: u.tweets.length,
            };
          })
          .filter((u) => u.impressions > 0);

        leaderboardData.sort((a, b) => b.impressions - a.impressions);

        const userIndex = leaderboardData.findIndex((u) => u.id === user.id);
        userRank = userIndex !== -1 ? userIndex + 1 : null;
      }
    }

    return {
      user: { ...user, tweetCounts },
      metadata,
      userRank,
      hasTurnedOffCampaign,
    };
  }

  async dashboard(res: Response, req: Request) {
    // @ts-ignore
    const profileId = req.user?.profileId;
    const info = await this.info(profileId, 'profileId');
    this.response.sendSuccess(res, StatusCodes.OK, {
      data: {
        user: info.user,
        metadata: info.metadata,
        userRank: info.userRank,
        hasTurnedOffCampaign: info.hasTurnedOffCampaign,
      },
    });
  }

  async verifySmartKey(res: Response, { key, username }: SmartKeyDTO) {
    try {
      const userExist = await this.prisma.user.findUnique({
        where: { username },
      });

      if (!userExist) {
        return this.response.sendError(
          res,
          StatusCodes.NotFound,
          'Account not found',
        );
      }

      const decryptedKey = decryptKey(
        key,
        `${process.env.X_CLIENT_SECRET}-${userExist.profileId}`,
      );
      const decryptedAuthKey = decryptKey(
        userExist.smartKey,
        `${process.env.X_CLIENT_SECRET}-${userExist.profileId}`,
      );

      const isMatch = decryptedKey === decryptedAuthKey;
      if (!isMatch) {
        return this.response.sendError(
          res,
          StatusCodes.Unauthorized,
          'Invalid Smart Key',
        );
      }

      const info = await this.info(key, 'smartKey');
      this.response.sendSuccess(res, StatusCodes.OK, {
        data: {
          user: info.user,
          metadata: info.metadata,
          userRank: info.userRank,
          hasTurnedOffCampaign: info.hasTurnedOffCampaign,
        },
      });
    } catch (err) {
      this.misc.handleServerError(res, err, 'Error decrypting key');
    }
  }

  async verifyRef(req: Request, res: Response, { username }: RefDTO) {
    try {
      // @ts-ignore
      const sub = req.user?.sub;

      const referral = await this.prisma.user.findUnique({
        where: { username: username.toLowerCase() },
      });

      if (!referral) {
        return this.response.sendError(
          res,
          StatusCodes.NotFound,
          'Referral does not exist',
        );
      }

      const referred = await this.prisma.user.findUnique({
        where: { id: sub },
      });

      if (referred && referred.useRef) {
        return this.response.sendError(
          res,
          StatusCodes.BadRequest,
          'Already used your referral',
        );
      }

      const { point } = await this.prisma.settings.findFirst();

      await this.prisma.$transaction([
        this.prisma.user.update({
          where: { id: referral.id },
          data: {
            refPoint: { increment: point },
          },
        }),
        this.prisma.user.update({
          where: { id: referred.id },
          data: { useRef: true },
        }),
      ]);

      this.response.sendSuccess(res, StatusCodes.OK, { message: 'Successful' });
    } catch (err) {
      this.misc.handleServerError(res, err);
    }
  }

  async fetchTasks(res: Response) {
    this.response.sendSuccess(res, StatusCodes.OK, {
      data: await this.prisma.task.findMany(),
    });
  }

  async addCampaignRequest(res: Response, dto: CampaignRequestDTO) {
    try {
      const campaign = await this.prisma.campaignRequest.create({
        data: {
          step: dto.step,
          tx_id: dto.tx_id,
          action: dto.action,
          discord: dto.discord,
          twitter: dto?.twitter,
          soft_cap: dto.soft_cap,
          hard_cap: dto.hard_cap,
          tx_status: dto.tx_status,
          user_addr: dto.user_addr,
          token_desc: dto.token_desc,
          token_name: dto.token_name,
          token_image: dto.token_image,
          is_campaign: dto.is_campaign,
          minimum_buy: dto.minimum_buy,
          maximum_buy: dto.maximum_buy,
          token_ticker: dto.token_ticker,
          token_supply: dto.token_supply,
          token_address: dto.token_address,
          token_website: dto.token_website,
          end_date: new Date(dto.end_date),
          start_date: new Date(dto.start_date),
          sale_allocation: dto.sale_allocation,
          sale_description: dto.sale_description,
          campaign_twitter: dto.campaign_twitter,
          campaign_hashtags: dto.campaign_hashtags,
          listing_allocation: dto.listing_allocation,
          campaign_allocation: dto.campaign_allocation,
          campaign_description: dto.campaign_description,
        },
      });

      res.on('finish', async () => {
        if (campaign) {
          await this.cloudflare.createDeployment();
        }
      });

      this.response.sendSuccess(res, StatusCodes.OK, { message: 'Saved' });
    } catch (err) {
      console.error(err);
      this.misc.handleServerError(res, err);
    }
  }

  async addTokenMint(res: Response, dto: TokenMintDTO) {
    try {
      await this.prisma.mintedToken.upsert({
        where: { token_address: dto.token_address },
        create: {
          ...dto,
        },
        update: {
          ...dto,
        },
      });
      this.response.sendSuccess(res, StatusCodes.OK, { message: 'Saved' });
    } catch (err) {
      this.misc.handleServerError(res, err);
    }
  }

  async fetchMintedTokens(res: Response) {
    const requests = await this.prisma.mintedToken.findMany({
      orderBy: { createdAt: 'desc' },
    });

    this.response.sendSuccess(res, StatusCodes.OK, { data: requests });
  }

  async fetchMintedToken(res: Response, token_address: string) {
    const request = await this.prisma.mintedToken.findUnique({
      where: { token_address },
    });

    this.response.sendSuccess(res, StatusCodes.OK, { data: request });
  }

  async fetchUserMintedTokens(res: Response, user_addr: string) {
    const request = await this.prisma.mintedToken.findMany({
      where: { user_addr },
    });

    this.response.sendSuccess(res, StatusCodes.OK, { data: request });
  }

  async fetchCampaignRequests(res: Response) {
    const requests = await this.prisma.campaignRequest.findMany({
      orderBy: { createdAt: 'desc' },
      where: { is_campaign: true },
    });

    this.response.sendSuccess(res, StatusCodes.OK, { data: requests });
  }

  async fetchCampaignRequest(res: Response, token_address: string) {
    const request = await this.prisma.campaignRequest.findUnique({
      where: { token_address, is_campaign: true },
    });

    if (!request) {
      this.response.sendError(
        res,
        StatusCodes.NotFound,
        'Campaign Request not found',
      );
    }

    this.response.sendSuccess(res, StatusCodes.OK, { data: request });
  }

  async waitlist(res: Response, { email }: WaitListDTO) {
    const isExist = await this.prisma.waitList.findUnique({
      where: { email },
    });

    if (isExist) {
      return this.response.sendError(
        res,
        StatusCodes.OK,
        "You're already added to the waitlist",
      );
    }

    await this.prisma.waitList.create({
      data: { email },
    });

    const waitlistsCount = await this.prisma.waitList.count();
    const lastDigit = waitlistsCount % 10;
    const ommittedDigits = [11, 12, 13];

    this.response.sendSuccess(res, StatusCodes.OK, {
      message: `Congratulations! You're the ${waitlistsCount}${ommittedDigits.includes(waitlistsCount) ? 'th' : lastDigit === 3 ? `rd` : lastDigit === 2 ? 'nd' : lastDigit === 1 ? 'st' : 'th'} person on the waitlist`,
    });
  }

  async getAllTokens(res: Response) {
    const requests = await this.prisma.allTokens.findMany();
    this.response.sendSuccess(res, StatusCodes.OK, { data: requests });
  }

  async getVelarTokens(res: Response) {
    const data = await this.apiService.getVelarTokens();
    this.response.sendSuccess(res, StatusCodes.OK, { data: data });
  }

  async getAlexTokens(res: Response) {
    const data = await this.apiService.getAlexTokens();
    this.response.sendSuccess(res, StatusCodes.OK, { data: data });
  }

  async getAlexPools(res: Response) {
    const data = await this.apiService.getAlexPools();
    this.response.sendSuccess(res, StatusCodes.OK, { data: data });
  }

  async getChartData(res: Response, chart: ChartDTO) {
    const data = await this.apiService.getChartData(chart.token);

    const transformedData = data.map((item: any) => ({
      x: item?.time,
      y: item?.close,
    }));

    this.response.sendSuccess(res, StatusCodes.OK, { data: transformedData });
  }

  async getSTXChart(res: Response) {
    const data = await this.apiService.getSTXData();
    const transformedData = data.map((item: any) => ({
      time: new Date(item[0]).toISOString(),
      open: Number(item[1]),
      high: Number(item[2]),
      low: Number(item[3]),
      close: Number(item[4]),
      volume: Number(item[5]),
    }));
    this.response.sendSuccess(res, StatusCodes.OK, { data: transformedData });
  }

  async getChartDataOld(res: Response, chart: ChartDTO) {
    const data = await this.apiService.getChartData(chart.token);
    this.response.sendSuccess(res, StatusCodes.OK, { data: data });
  }

  async getChartDataV2(res: Response, chart: ChartDTO) {
    const data = await this.apiService.getChartDataV2(chart.token);
    this.response.sendSuccess(res, StatusCodes.OK, { data: data });
  }

  async getBalances(res: Response, chart: BalanceDTO) {
    const data = await this.apiService.getBalance(chart.address);
    this.response.sendSuccess(res, StatusCodes.OK, { data: data });
  }

  //   TVL
  // - Locker - done
  // - Community Pool = done
  // - Staking - done (from ca)

  // Volume
  // - Dex - done
  // - Presale - done (from ca)
  // - Launchpad - done
  // - OTC - done
  // - Games - coming

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async updateTokenLockerVolume() {
    try {
      const contractName = 'memegoat-locker-vault-v1-1';
      const contractOffsets = await this.prisma.contractOffsets.findUnique({
        where: { contract: contractName },
      });
      const offset = contractOffsets ? contractOffsets.nextOffset : 0;
      const record = await this.txnVolumeService.recordTxnData({
        contractName,
        offset,
        totalTx: contractOffsets.totalTransactions,
        // lastTxTime: contractOffsets.lastTxTime,
      });
      // await this.updateDBVol(contractName, record, true);
      // await this.updateTVLUsdValue(record.data);
      // await this.prisma.$transaction(
      //   record.data.map((vol) =>
      //     this.prisma.lockerVolume.upsert({
      //       where: { token: vol.token },
      //       update: {
      //         amount: {
      //           increment: vol.amount,
      //         },
      //       },
      //       create: {
      //         token: vol.token,
      //         amount: vol.amount,
      //       },
      //     }),
      //   ),
      // );
      return record;
    } catch (err) {
      console.error(err);
    }
  }

  async updateOTCVolume(res: Response) {
    const contractName = 'memegoat-vault-v1';
    const contractOffsets = await this.prisma.contractOffsets.findUnique({
      where: { contract: contractName },
    });
    const offset = contractOffsets ? contractOffsets.nextOffset : 0;
    const record = await this.txnVolumeService.recordTxnData({
      contractName,
      offset,
      totalTx: contractOffsets.totalTransactions,
    });
    await this.updateDBVol(contractName, record, false);
    this.response.sendSuccess(res, StatusCodes.OK, { data: record });
  }

  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async updateCommunityPoolsVolume() {
    try {
      const contractName = 'memegoat-stakepool-vault-v1';
      const contractOffsets = await this.prisma.contractOffsets.findUnique({
        where: { contract: contractName },
      });
      const offset = contractOffsets ? contractOffsets.nextOffset : 0;
      const record = await this.txnVolumeService.recordTxnData({
        contractName,
        offset,
        totalTx: contractOffsets.totalTransactions,
        // lastTxTime: contractOffsets.lastTxTime,
      });
      // await this.updateDBVol(contractName, record, true);
      // await this.updateTVLUsdValue(record.data);
      // await this.prisma.$transaction(
      //   record.data.map((vol) =>
      //     this.prisma.communityPoolVolume.upsert({
      //       where: { token: vol.token },
      //       update: {
      //         amount: {
      //           increment: vol.amount,
      //         },
      //       },
      //       create: {
      //         token: vol.token,
      //         amount: vol.amount,
      //       },
      //     }),
      //   ),
      // );
      return record;
    } catch (err) {
      console.error(err);
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async updateLaunchpadVolume() {
    try {
      const contractName = 'memegoat-launchpad-vault';
      const contractOffsets = await this.prisma.contractOffsets.findUnique({
        where: { contract: contractName },
      });
      const offset = contractOffsets ? contractOffsets.nextOffset : 0;
      const record = await this.txnVolumeService.recordTxnData({
        contractName,
        offset,
        totalTx: contractOffsets.totalTransactions,
        // lastTxTime: contractOffsets.lastTxTime,
      });
      // await this.updateDBVol(contractName, record, false);
      // await this.updateMemegoatVolUSDValue(record.data);
      // await this.prisma.$transaction(
      //   record.data.map((vol) =>
      //     this.prisma.launchpadVolume.upsert({
      //       where: { token: vol.token },
      //       update: {
      //         amount: {
      //           increment: vol.amount,
      //         },
      //       },
      //       create: {
      //         token: vol.token,
      //         amount: vol.amount,
      //       },
      //     }),
      //   ),
      // );
      return record;
    } catch (err) {
      console.error(err);
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async updateDexVolume() {
    try {
      const contractName = 'memegoat-aggregator-v1-1';
      const contractOffsets = await this.prisma.contractOffsets.findUnique({
        where: { contract: contractName },
      });
      const offset = contractOffsets ? contractOffsets.nextOffset : 0;
      const record = await this.txnVolumeService.recordTxnData({
        contractName,
        offset,
        totalTx: contractOffsets.totalTransactions,
        // lastTxTime: contractOffsets.lastTxTime,
      });
      // await this.updateDBVol(contractName, record, false);
      // await this.updateMemegoatVolUSDValue(record.data);
      // await this.prisma.$transaction(
      //   record.data.map((vol) =>
      //     this.prisma.dexVolume.upsert({
      //       where: { token: vol.token },
      //       update: {
      //         amount: {
      //           increment: vol.amount,
      //         },
      //       },
      //       create: {
      //         token: vol.token,
      //         amount: vol.amount,
      //       },
      //     }),
      //   ),
      // );
      return record;
    } catch (err) {
      console.error(err);
    }
  }

  async getTotalstakedMemegoat() {
    const data: contractDTO = {
      contract: 'memegoat-staking-v1',
      function: 'get-total-staked',
      arguments: [],
    };
    const amount = await this.contractService.readContract(data);
    return amount;
  }

  async getMemegoatVolumeRes(res: Response) {
    const data = await this.getMemegoatVol();
    this.response.sendSuccess(res, StatusCodes.OK, { data: data });
  }

  async getMemegoatVol() {
    const volData = await this.prisma.memegoatVolume.findMany();
    const data = volData.map((data) => {
      if (data.token === 'STX') {
        const presale = 50000000000;
        return {
          ...data,
          amount: new BigNumber(
            new BigNumber(data.amount.toString()).plus(new BigNumber(presale)),
          ).toFixed(),
        };
      } else {
        return {
          ...data,
          amount: new BigNumber(data.amount as any).toFixed(),
        };
      }
    });
    return data;
  }

  async getMemegoatVolUSDValue(res: Response) {
    const memegoatVolUsdValue = await this.prisma.uSDRecords.findUnique({
      where: { record: 'VOLUME' },
    });

    this.response.sendSuccess(res, StatusCodes.OK, {
      data: new BigNumber(memegoatVolUsdValue.amount.toString())
        .dividedBy(new BigNumber(10).pow(6))
        .toFixed(),
    });
  }

  async updateMemegoatVolUSDValue(memegoatVol: token[]) {
    try {
      const memegoatVolUsdValue = await memegoatVol.reduce(
        async (prevPromise, value) => {
          const prev = await prevPromise;
          let usdValue: any;

          if (value.token === 'STX') {
            usdValue = await this.txnVolumeService.getUSDValueSTX(
              new BigNumber(value.amount)
                .multipliedBy(new BigNumber(10).pow(6))
                .toFixed(0),
            );
          } else {
            usdValue = await this.txnVolumeService.getUSDValueToken(
              value.token,
              new BigNumber(value.amount)
                .multipliedBy(new BigNumber(10).pow(6))
                .toFixed(0),
            );
          }
          return new BigNumber(prev).plus(new BigNumber(usdValue)).toFixed(0);
        },
        Promise.resolve('0'),
      );
      await this.prisma.uSDRecords.upsert({
        where: { record: 'VOLUME' },
        update: {
          amount: {
            increment: BigInt(memegoatVolUsdValue) as any,
          },
        },
        create: {
          record: 'VOLUME',
          amount: BigInt(memegoatVolUsdValue) as any,
        },
      });
    } catch (err) {
      console.error(err);
    }
  }

  async getTVLRes(res: Response) {
    const data = await this.getTVL();
    this.response.sendSuccess(res, StatusCodes.OK, { data: data });
  }

  async getTVL() {
    const volData = await this.prisma.tVL.findMany();
    const stakedGoat = await this.getTotalstakedMemegoat();
    const data = volData.map((data) => {
      if (
        data.token === 'SP2F4QC563WN0A0949WPH5W1YXVC4M1R46QKE0G14.memegoatstx'
      ) {
        return {
          ...data,
          amount: new BigNumber(
            new BigNumber(data.amount.toString()).plus(
              new BigNumber(stakedGoat),
            ),
          ).toFixed(),
        };
      } else {
        return {
          ...data,
          amount: new BigNumber(data.amount as any).toFixed(),
        };
      }
    });
    return data;
  }

  async getTVLUSDValue(res: Response) {
    const tvlUSDValue = await this.prisma.uSDRecords.findUnique({
      where: { record: 'TVL' },
    });
    this.response.sendSuccess(res, StatusCodes.OK, {
      data: new BigNumber(tvlUSDValue.amount.toString())
        .dividedBy(new BigNumber(10).pow(6))
        .toFixed(0),
    });
  }

  async updateTVLUsdValue(tvlData: token[]) {
    try {
      const tvlUSDValue = await tvlData.reduce(async (prevPromise, value) => {
        const prev = await prevPromise;
        let usdValue: any;

        if (value.token === 'STX') {
          usdValue = await this.txnVolumeService.getUSDValueSTX(
            new BigNumber(value.amount)
              .multipliedBy(new BigNumber(10).pow(6))
              .toFixed(0),
          );
        } else {
          usdValue = await this.txnVolumeService.getUSDValueToken(
            value.token,
            new BigNumber(value.amount)
              .multipliedBy(new BigNumber(10).pow(6))
              .toFixed(0),
          );
        }
        return new BigNumber(prev).plus(new BigNumber(usdValue)).toFixed(0);
      }, Promise.resolve('0'));
      await this.prisma.uSDRecords.upsert({
        where: { record: 'TVL' },
        update: {
          amount: {
            increment: BigInt(tvlUSDValue) as any,
          },
        },
        create: {
          record: 'TVL',
          amount: BigInt(tvlUSDValue) as any,
        },
      });
    } catch (err) {
      console.error(err);
    }
  }

  async updateDBVol(
    contractName: string,
    record: txVolumeOutput,
    isTvl: boolean,
  ) {
    await this.prisma.contractOffsets.upsert({
      where: { contract: contractName },
      update: {
        totalTransactions: record.totalTxns,
        nextOffset: record.nextOffset,
      },
      create: {
        contract: contractName,
        totalTransactions: record.totalTxns,
        nextOffset: record.nextOffset,
      },
    });

    if (isTvl) {
      await this.prisma.$transaction(
        record.data.map((vol) =>
          this.prisma.tVL.upsert({
            where: { token: vol.token },
            update: {
              amount: {
                increment: vol.amount,
              },
            },
            create: {
              token: vol.token,
              amount: vol.amount,
            },
          }),
        ),
      );
    } else {
      await this.prisma.$transaction(
        record.data.map((vol) =>
          this.prisma.memegoatVolume.upsert({
            where: { token: vol.token },
            update: {
              amount: {
                increment: vol.amount,
              },
            },
            create: {
              token: vol.token,
              amount: vol.amount,
            },
          }),
        ),
      );
    }
  }
}
