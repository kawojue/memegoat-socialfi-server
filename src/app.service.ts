import { RefDTO } from './dto/ref.dto'
import { Request, Response } from 'express'
import { Injectable } from '@nestjs/common'
import { SmartKeyDTO } from './dto/key.dto'
import { decryptKey } from 'helpers/smartKey'
import { StatusCodes } from 'enums/statusCodes'
import { PrismaService } from 'prisma/prisma.service'
import { ResponseService } from 'lib/response.service'

@Injectable()
export class AppService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly response: ResponseService,
  ) { }

  getHello(): string {
    return 'Memegoat!'
  }

  async leaderboard(res: Response) {
    try {
      const now = new Date()
      const settings = await this.prisma.settings.findFirst()
      const { days, hasTurnedOffCampaign, campaignedAt } = settings

      if (!campaignedAt || hasTurnedOffCampaign) {
        return this.response.sendSuccess(res, StatusCodes.OK, { data: [] })
      }

      const campaignEndDate = new Date(campaignedAt)
      campaignEndDate.setDate(campaignEndDate.getDate() + days)

      if (now > campaignEndDate) {
        return this.response.sendSuccess(res, StatusCodes.OK, { data: [] })
      }

      const daysAgo = new Date(now)
      daysAgo.setDate(now.getDate() - days)

      const users = await this.prisma.user.findMany({
        select: {
          tweets: {
            where: {
              createdAt: {
                gte: daysAgo,
                lte: now,
              },
            },
          },
          avatar: true,
          username: true,
          displayName: true,
        },
      })

      let leaderboardData: {
        tweets: number
        username: string
        impressions: number
        displayName: string
        avatar: string | null
      }[] = []

      for (const user of users) {
        let impressions = 0

        for (const tweet of user.tweets) {
          if (tweet.referenced) {
            impressions +=
              tweet.like +
              tweet.retweet +
              tweet.reply +
              tweet.impression +
              tweet.quote
          }
        }

        if (impressions > 0) {
          leaderboardData.push({
            impressions,
            avatar: user.avatar,
            username: user.username,
            tweets: user.tweets.length,
            displayName: user.displayName,
          })
        }
      }

      leaderboardData.sort((a, b) => b.impressions - a.impressions)

      this.response.sendSuccess(res, StatusCodes.OK, { data: leaderboardData })
    } catch (err) {
      console.error('Error generating leaderboard:', err)
      this.response.sendError(res, StatusCodes.InternalServerError, 'Something went wrong while generating leaderboard')
    }
  }

  private async info(key: string, fieldName: 'smartKey' | 'profileId') {
    const now = new Date()
    const settings = await this.prisma.settings.findFirst()
    const { days, hasTurnedOffCampaign, campaignedAt } = settings

    const user = await this.prisma.user.findUnique({
      where: fieldName === 'profileId' ? { profileId: key } : { smartKey: key },
    })

    if (!user) return

    const metadata = {
      views: 0,
      likes: 0,
      quotes: 0,
      replies: 0,
      retweets: 0,
    }

    const tweets = await this.prisma.tweet.findMany({
      where: { userId: user.id }
    })

    const tweetCounts = await this.prisma.tweet.count({
      where: { userId: user.id }
    })

    for (const tweet of tweets) {
      metadata.likes += tweet.like
      metadata.quotes += tweet.quote
      metadata.replies += tweet.reply
      metadata.views += tweet.impression
      metadata.retweets += tweet.retweet
    }

    let userRank = null

    if (!hasTurnedOffCampaign && campaignedAt) {
      const campaignEndDate = new Date(campaignedAt)
      campaignEndDate.setDate(campaignedAt.getDate() + days)

      if (now <= campaignEndDate) {
        const daysAgo = new Date(now)
        daysAgo.setDate(now.getDate() - days)

        const users = await this.prisma.user.findMany({
          select: {
            id: true,
            refPoint: true,
            tweets: {
              where: {
                createdAt: {
                  gte: daysAgo,
                  lte: now,
                },
              },
            },
          },
        })

        const leaderboardData = users.map(u => {
          let impressions = u.refPoint

          for (const tweet of u.tweets) {
            if (tweet.referenced) {
              impressions +=
                tweet.like +
                tweet.retweet +
                tweet.reply +
                tweet.impression +
                tweet.quote
            }
          }

          return {
            id: u.id,
            impressions,
            tweets: u.tweets.length,
          }
        }).filter(u => u.impressions > 0)

        leaderboardData.sort((a, b) => b.impressions - a.impressions)

        const userIndex = leaderboardData.findIndex(u => u.id === user.id)
        userRank = userIndex !== -1 ? userIndex + 1 : null
      }
    }

    return { user: { ...user, tweetCounts }, metadata, userRank, hasTurnedOffCampaign }
  }

  async dashboard(res: Response, req: Request) {
    // @ts-ignore
    const profileId = req.user?.profileId
    const info = await this.info(
      profileId,
      'profileId',
    )
    this.response.sendSuccess(res, StatusCodes.OK, {
      data: {
        user: info.user,
        metadata: info.metadata,
        userRank: info.userRank,
        hasTurnedOffCampaign: info.hasTurnedOffCampaign,
      },
    })
  }

  async verifySmartKey(res: Response, { key, username }: SmartKeyDTO) {
    try {
      const userExist = await this.prisma.user.findUnique({
        where: { username },
      })

      if (!userExist) {
        return this.response.sendError(
          res,
          StatusCodes.NotFound,
          'Account not found',
        )
      }

      const decryptedKey = decryptKey(
        key,
        `${process.env.X_CLIENT_SECRET}-${userExist.profileId}`,
      )
      const decryptedAuthKey = decryptKey(
        userExist.smartKey,
        `${process.env.X_CLIENT_SECRET}-${userExist.profileId}`,
      )

      const isMatch = decryptedKey === decryptedAuthKey
      if (!isMatch) {
        return this.response.sendError(
          res,
          StatusCodes.Unauthorized,
          'Invalid Smart Key',
        )
      }

      const { user, metadata, userRank } = await this.info(key, 'smartKey')
      this.response.sendSuccess(res, StatusCodes.OK, {
        data: { user, metadata, userRank },
      })
    } catch (err) {
      console.error(err)
      return this.response.sendError(
        res,
        StatusCodes.InternalServerError,
        'Error decrypting key',
      )
    }
  }

  async verifyRef(req: Request, res: Response, { username }: RefDTO) {
    try {
      // @ts-ignore
      const sub = req.user?.sub

      const referral = await this.prisma.user.findUnique({
        where: { username: username.toLowerCase() },
      })

      if (!referral) {
        return this.response.sendError(
          res,
          StatusCodes.NotFound,
          'Referral does not exist',
        )
      }

      const referred = await this.prisma.user.findUnique({
        where: { id: sub },
      })

      if (referred && referred.useRef) {
        return this.response.sendError(
          res,
          StatusCodes.BadRequest,
          'Already used your referral',
        )
      }

      const { point } = await this.prisma.settings.findFirst()

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
      ])

      this.response.sendSuccess(res, StatusCodes.OK, {
        message: 'Successful',
      })
    } catch (err) {
      console.error(err)
      return this.response.sendError(
        res,
        StatusCodes.InternalServerError,
        'Something went wrong',
      )
    }
  }

  async fetchTasks(res: Response) {
    this.response.sendSuccess(res, StatusCodes.OK, {
      data: await this.prisma.task.findMany()
    })
  }
}
