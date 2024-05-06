
const Twitter = require('twitter-v2')
import { Request, Response } from 'express'
import { StatusCodes } from 'enums/statusCodes'
import { PrismaService } from 'prisma/prisma.service'
import { ResponseService } from 'lib/response.service'
import { HttpException, Injectable } from '@nestjs/common'
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

  async metrics(res: Response) {
    try {
      const users = await this.prisma.user.findMany()

      for (const user of users) {
        const { data: { data: tweets } } = await this.x.v2.userTimeline(user.profileId, {
          max_results: 100,
          expansions: 'referenced_tweets.id',
          'tweet.fields': 'public_metrics',
        })

        for (const { id, public_metrics, text, referenced_tweets } of tweets) {
          if (text.includes('@GoatCoinSTX') || text.toLowerCase().includes('$goat')) {
            let referenced = false

            if (referenced_tweets) {
              for (const { id } of referenced_tweets) {
                const { data } = await this.x.v2.singleTweet(id, {
                  'tweet.fields': 'author_id'
                })

                if (data.author_id === process.env.X_PROFILE_ID) {
                  referenced = true
                }
              }
            }

            const existingTweet = await this.prisma.tweet.findUnique({
              where: { postId: id },
            })

            if (existingTweet) {
              if (public_metrics.impression_count > existingTweet.impression) {
                await this.prisma.tweet.update({
                  where: { postId: id },
                  data: {
                    referenced,
                    like: public_metrics.like_count,
                    reply: public_metrics.reply_count,
                    quote: public_metrics.quote_count,
                    retweet: public_metrics.retweet_count,
                    impression: public_metrics.impression_count,
                  },
                })
              }
            } else {
              await this.prisma.tweet.create({
                data: {
                  postId: id,
                  referenced,
                  like: public_metrics.like_count,
                  reply: public_metrics.reply_count,
                  quote: public_metrics.quote_count,
                  retweet: public_metrics.retweet_count,
                  impression: public_metrics.impression_count,
                  user: { connect: { id: user.id } }
                },
              })
            }
          }
        }
      }

      this.response.sendSuccess(res, StatusCodes.OK, {})
    } catch (err) {
      console.error(err)
      throw new HttpException('Task is down', StatusCodes.InternalServerError)
    }
  }

  async leaderboard(res: Response) {
    try {
      const users = await this.prisma.user.findMany({
        select: {
          tweets: true,
          username: true,
          displayName: true,
        },
      })

      const leaderboardData = []
      for (const user of users) {
        let impressions = 0

        for (const tweet of user.tweets) {
          if (tweet.referenced) {
            impressions += tweet.like + tweet.retweet + tweet.reply + tweet.impression + tweet.quote
          }
        }

        if (impressions > 0) {
          leaderboardData.push({
            impressions,
            username: user.username,
            tweets: user.tweets.length,
            displayName: user.displayName,
          })
        }
      }

      leaderboardData.sort((a, b) => b.impressions - a.impressions)

      this.response.sendSuccess(res, StatusCodes.OK, { data: leaderboardData })
    } catch (err) {
      console.error(err)
      this.response.sendError(res, StatusCodes.InternalServerError, 'Something went wrong')
    }
  }
}
