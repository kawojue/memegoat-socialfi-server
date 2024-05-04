import { Module } from '@nestjs/common'
import { AppService } from './app.service'
import { AppController } from './app.controller'
import { LeaderboardModule } from './leaderboard/leaderboard.module'

@Module({
  imports: [LeaderboardModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
