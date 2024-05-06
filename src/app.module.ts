import { Module } from '@nestjs/common'
import { AppService } from './app.service'
import { XStrategy } from './jwt/x.strategy'
import { AppController } from './app.controller'
import { PassportModule } from '@nestjs/passport'
import { PrismaService } from 'prisma/prisma.service'
import { ResponseService } from 'lib/response.service'
import { SessionSerializer } from './jwt/session.serialize'
import { LeaderboardModule } from './leaderboard/leaderboard.module'

@Module({
  imports: [
    LeaderboardModule,
    PassportModule.register({ defaultStrategy: 'twitter' })
  ],
  controllers: [AppController],
  providers: [
    AppService,
    XStrategy,
    PrismaService,
    ResponseService,
    SessionSerializer,
  ],
})

export class AppModule { }
