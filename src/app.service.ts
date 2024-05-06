import { JwtService } from '@nestjs/jwt'
import { Request, Response } from 'express'
import { Injectable } from '@nestjs/common'
import { StatusCodes } from 'enums/statusCodes'
import { PrismaService } from 'prisma/prisma.service'
import { ResponseService } from 'lib/response.service'

@Injectable()
export class AppService {

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly response: ResponseService,
  ) { }

  getHello(): string {
    return 'Memegoat!'
  }

  async auth(req: Request) {
    try {
      // @ts-ignore
      const profile = req.user?.profile

      const profileId = profile.id?.toString()

      const photos = profile.photos
      let image: string = null

      if (photos.length > 0) {
        image = photos[0]?.value
      }

      let user = await this.prisma.user.findUnique({
        where: { profileId }
      })

      if (user && (
        user.avatar !== image ||
        user.username !== profile.username ||
        user.displayName !== profile.displayName
      )) {
        await this.prisma.user.update({
          where: { profileId },
          data: {
            avatar: image,
            username: profile.username,
            displayName: profile.displayName,
          }
        })
      }

      if (!user) {
        user = await this.prisma.user.create({
          data: {
            avatar: image,
            profileId: profileId,
            username: profile.username,
            displayName: profile.displayName,
          }
        })
      }

      const payload = { username: user.username, sub: user.id, profileId }
      const token = await this.jwtService.signAsync(payload)

      return { user, token }
    } catch (err) {
      console.error(err)
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

      const leaderboardData = [] as {
        tweets: number
        username: string
        impressions: number
        displayName: string
      }[]

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

  async dashboard(res: Response, req: Request) {
    const user = await this.prisma.user.findUnique({
      where: {
        // @ts-ignore
        profileId: req.user?.profileId
      },
      include: { tweets: true }
    })

    if (!user) {
      return this.response.sendError(res, StatusCodes.NotFound, 'Account not found')
    }

    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        tweets: true,
        username: true,
        displayName: true,
      },
    })

    const leaderboardData = [] as {
      id: string
      tweets: number
      username: string
      impressions: number
      displayName: string
    }[]

    for (const u of users) {
      let impressions = 0

      for (const tweet of u.tweets) {
        if (tweet.referenced) {
          impressions += tweet.like + tweet.retweet + tweet.reply + tweet.impression + tweet.quote
        }
      }

      if (impressions > 0) {
        leaderboardData.push({
          id: u.id,
          impressions,
          username: u.username,
          tweets: u.tweets.length,
          displayName: u.displayName,
        })
      }
    }

    leaderboardData.sort((a, b) => b.impressions - a.impressions)

    const userIndex = leaderboardData.findIndex(u => u.id === user.id)
    const userRank = userIndex !== -1 ? userIndex + 1 : null

    const responseData = {
      data: user,
      userRank: userRank,
    }

    this.response.sendSuccess(res, StatusCodes.OK, responseData)
  }
}