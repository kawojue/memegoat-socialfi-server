import { Module } from '@nestjs/common'
import { PrismaService } from 'prisma/prisma.service'
import { LeaderboardService } from './leaderboard.service'
import { LeaderboardController } from './leaderboard.controller'

@Module({
  controllers: [LeaderboardController],
  providers: [LeaderboardService, PrismaService],
})
export class LeaderboardModule { }
