import { JwtService } from '@nestjs/jwt'
import { Request, Response } from 'express'
import { Injectable } from '@nestjs/common'
import { encryptKey } from 'helpers/smartKey'
import { PrismaService } from 'prisma/prisma.service'

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) { }

  async auth(req: Request) {
    try {
      // @ts-ignore
      const profile = req.user?.profile

      const profileId = profile.id?.toString()
      const username = profile.username.toLowerCase()

      const photos = profile.photos
      let image: string = null

      if (photos.length > 0) {
        image = photos[0]?.value
      }

      let user = await this.prisma.user.findUnique({
        where: { profileId },
      })

      if (
        user &&
        (user.avatar !== image ||
          user.username !== username ||
          user.displayName !== profile.displayName)
      ) {
        await this.prisma.user.update({
          where: { profileId },
          data: {
            avatar: image, username,
            displayName: profile.displayName,
          },
        })
      }

      if (!user) {
        const encryptedKey = encryptKey(
          16,
          `${process.env.X_CLIENT_SECRET}-${profileId}`,
        )

        user = await this.prisma.user.create({
          data: {
            profileId: profileId,
            createdAt: new Date(),
            smartKey: encryptedKey,
            username, avatar: image,
            displayName: profile.displayName,
          },
        })
      }

      const token = await this.jwtService.signAsync({
        username,
        profileId,
        sub: user.id,
      })

      return token
    } catch (err) {
      console.error(err)
    }
  }
}
