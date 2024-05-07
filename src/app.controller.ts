import {
  Controller, Get, Req, Res, UseGuards,
} from '@nestjs/common'
import { AppService } from './app.service'
import { Request, Response } from 'express'
import { ApiBearerAuth } from '@nestjs/swagger'
import { JwtAuthGuard } from './jwt/jwt-auth.guard'

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get()
  getHello(): string {
    return this.appService.getHello()
  }

  @Get('/leaderboard')
  async leaderboard(@Res() res: Response) {
    await this.appService.leaderboard(res)
  }

  @Get('/dashboard')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async dashboard(@Req() req: Request, @Res() res: Response) {
    await this.appService.dashboard(res, req)
  }
}