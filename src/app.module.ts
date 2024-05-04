import { Module } from '@nestjs/common'
import { AppService } from './app.service'
import { XStrategy } from './jwt/x.strategy'
import { AppController } from './app.controller'
import { PassportModule } from '@nestjs/passport'
import { PrismaService } from 'prisma/prisma.service'
import { ResponseService } from 'lib/response.service'
import { LeaderboardModule } from './leaderboard/leaderboard.module'

@Module({
  imports: [
    LeaderboardModule,
    PassportModule.register({ defaultStrategy: 'twitter' })
  ],
  controllers: [AppController],
  providers: [AppService, XStrategy, PrismaService, ResponseService],
})
export class AppModule { }
