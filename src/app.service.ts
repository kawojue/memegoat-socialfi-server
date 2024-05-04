import { Injectable } from '@nestjs/common'
import { PrismaService } from 'prisma/prisma.service'
import { ResponseService } from 'lib/response.service'

@Injectable()
export class AppService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly response: ResponseService
  ) { }
  getHello(): string {
    return 'Memegoat!'
  }

  async auth(profile: any) {
    try {
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
}
