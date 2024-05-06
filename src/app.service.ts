const Twitter = require('twitter-v2')
import { Injectable } from '@nestjs/common'
import { Request, Response } from 'express'
import { StatusCodes } from 'enums/statusCodes'
import { PrismaService } from 'prisma/prisma.service'
import { ResponseService } from 'lib/response.service'
import { Cron, CronExpression } from '@nestjs/schedule'
import { TwitterApi, TwitterApiReadOnly } from 'twitter-api-v2'

@Injectable()
export class AppService {
  private readonly twit: TwitterApi
  private readonly x: TwitterApiReadOnly
  private readonly tw: any

  constructor(
    private readonly prisma: PrismaService,
    private readonly response: ResponseService,
  ) {
    this.twit = new TwitterApi(`${process.env.X_BEARER_TOKEN}`)
    this.x = this.twit.readOnly

    this.tw = new Twitter({
      consumer_key: process.env.X_API_KEY,
      consumer_secret: process.env.X_API_SECRET,
      access_token_key: process.env.X_ACCESS_TOKEN,
      access_token_secret: process.env.X_ACCESS_TOKEN_SECRET,
    })
  }

  getHello(): string {
    return 'Memegoat!'
  }

  async auth(res: Response, req: Request) {
    try {
      // @ts-ignore
      const profile = req.user?.profile

      const profileId = profile.id?.toString()

      let user = await this.prisma.user.findUnique({
        where: { profileId }
      })

      if (user && (user.username !== profile.username || user.displayName !== user.displayName)) {
        await this.prisma.user.update({
          where: { profileId },
          data: {
            username: profile.username,
            displayName: profile.displayName,
          }
        })
      }

      if (!user) {
        user = await this.prisma.user.create({
          data: {
            profileId: profileId,
            username: profile.username,
            displayName: profile.displayName,
          }
        })
      }

      return user
    } catch (err) {
      console.error(err)
    }
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async metrics() {
    try {
      const users = await this.prisma.user.findMany()

      for (const user of users) {
        const { data: { data: tweets } } = await this.x.v2.userTimeline(user.profileId, {
          max_results: 100,
          'tweet.fields': 'public_metrics'
        })

        for (const { id, public_metrics, text } of tweets) {
          if (text.includes('@GoatCoinSTX')) {
            const existingTweet = await this.prisma.tweet.findUnique({
              where: { postId: id },
            })
            if (existingTweet) {
              if (public_metrics.impression_count > existingTweet.impression) {
                await this.prisma.tweet.update({
                  where: { postId: id },
                  data: { impression: public_metrics.impression_count },
                })
              }
            } else {
              await this.prisma.tweet.create({
                data: {
                  postId: id,
                  impression: public_metrics.impression_count,
                  user: { connect: { id: user.id } }
                },
              })
            }
          }
        }
      }
    } catch (err) {
      console.error(err)
    }
  }

  async leaderboard(res: Response) {
    const users = await this.prisma.user.findMany({
      select: {
        username: true,
        displayName: true,
        tweets: {
          select: { impression: true }
        }
      },
    })

    const usersWithImpressionSum = users.map(user => ({
      ...user,
      tweets: user.tweets.length,
      impressions: user.tweets.reduce((sum, tweet) => sum + tweet.impression, 0),
    }))

    usersWithImpressionSum.sort((a, b) => b.impressions - a.impressions)

    this.response.sendSuccess(res, StatusCodes.OK, { data: usersWithImpressionSum })
  }
}
