const Twitter = require('twitter-v2')
import { Injectable } from '@nestjs/common'
import { PrismaService } from 'prisma/prisma.service'
import { ResponseService } from 'lib/response.service'
import { Request, Response } from 'express'
import { StatusCodes } from 'enums/statusCodes'
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
    this.twit = new TwitterApi(process.env.X_BEARER_TOKEN)
    this.x = this.twit.readOnly
    this.tw = new Twitter({
      // bearer_token: process.env.X_BEARER_TOKEN,
      access_token_key: process.env.X_ACCESS_TOKEN,
      access_token_secret: process.env.X_ACCESS_TOKEN_SECRET,
      consumer_key: process.env.X_API_KEY,
      consumer_secret: process.env.X_API_SECRET,
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

        await this.prisma.stat.create({ data: { user: { connect: { id: user.id } } } })
      }

      return user
    } catch (err) {
      console.error(err)
    }
  }


  async check(res: Response) {
    try {
      const data = await this.tw.get('users/me')

      console.log(data)

      this.response.sendSuccess(res, StatusCodes.OK, {})
    } catch (err) {
      console.error(err)
      this.response.sendError(res, StatusCodes.InternalServerError, 'Somthing went wrong')
      return
    }
  }
}
