import { Request, Response } from 'express'
import { Controller, Get, Req, Res } from '@nestjs/common'
import { LeaderboardService } from './leaderboard.service'

@Controller('leaderboard')
export class LeaderboardController {
  constructor(private readonly leaderboardService: LeaderboardService) { }

  @Get('/')
  async auth(@Res() res: Response, @Req() req: Request) {
    return await this.leaderboardService.auth(res, req)
  }
}
