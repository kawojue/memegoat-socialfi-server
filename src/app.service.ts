import { RefDTO } from './dto/ref.dto';
import { ChartDTO } from './dto/chart.dto';
import { Request, Response } from 'express';
import { Injectable } from '@nestjs/common';
import { SmartKeyDTO } from './dto/key.dto';
import { ApiService } from 'lib/api.service';
import { decryptKey } from 'helpers/smartKey';
import { MiscService } from 'lib/misc.service';
import { StatusCodes } from 'enums/statusCodes';
import { WaitListDTO } from './dto/waitlist.dto';
import { PrismaService } from 'prisma/prisma.service';
import { ResponseService } from 'lib/response.service';
import { CampaignRequestDTO } from './dto/compaign-req.dto';
import { BalanceDTO } from './dto/balance.dto';

@Injectable()
export class AppService {
  constructor(
    private readonly misc: MiscService,
    private readonly prisma: PrismaService,
    private readonly response: ResponseService,
    private readonly apiService: ApiService,
  ) { }

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
      await this.prisma.campaignRequest.upsert({
        where: { token_address: dto.token_address },
        create: {
          ...dto,
          end_date: new Date(dto.end_date),
          start_date: new Date(dto.start_date),
        },
        update: {
          ...dto,
          end_date: new Date(dto.end_date),
          start_date: new Date(dto.start_date),
        },
      });

      this.response.sendSuccess(res, StatusCodes.OK, { message: 'Saved' });
    } catch (err) {
      this.misc.handleServerError(res, err);
    }
  }

  async fetchMintedTokens(res: Response) {
    const requests = await this.prisma.campaignRequest.findMany({
      orderBy: { createdAt: 'desc' },
    });

    this.response.sendSuccess(res, StatusCodes.OK, { data: requests });
  }

  async fetchMintedToken(res: Response, token_address: string) {
    const request = await this.prisma.campaignRequest.findUnique({
      where: { token_address },
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

  async getChartData(res: Response, chart: ChartDTO) {
    const data = await this.apiService.getChartData(chart.token);

    const transformedData = data.map((item: any) => ({
      x: item?.time,
      y: item?.close
    }))

    this.response.sendSuccess(res, StatusCodes.OK, { data: data });
  }

  async getBalances(res: Response, chart: BalanceDTO) {
    const data = await this.apiService.getBalance(chart.address);
    this.response.sendSuccess(res, StatusCodes.OK, { data: data });
  }
}
