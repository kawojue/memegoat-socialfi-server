import {
  Controller, Get, Req, Res, UseGuards
} from '@nestjs/common'
import { AppService } from './app.service'
import { Request, Response } from 'express'
import { AuthGuard } from '@nestjs/passport'
import { JwtAuthGuard } from './jwt/jwt-auth.guard'

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get()
  getHello(): string {
    return this.appService.getHello()
  }

  @Get('/auth/x')
  @UseGuards(AuthGuard('twitter'))
  async xLogin() { }

  @Get('/auth/x/callback')
  @UseGuards(AuthGuard('twitter'))
  async xCallback(@Req() req: Request, @Res() res: Response) {
    const { user, token } = await this.appService.auth(req)

    const isProd = process.env.NODE_ENV === 'production'

    if (!user) {
      res.redirect('http://localhost:3000/login')
    } else {
      res.cookie('token', token, {
        domain: isProd ? '' : undefined,
        secure: isProd,
        sameSite: isProd ? 'none' : 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      res.redirect('http://localhost:3000/dashboard')
    }
  }

  @Get('/leaderboard')
  async leaderboard(@Res() res: Response) {
    await this.appService.leaderboard(res)
  }

  @Get('/metrics')
  async metrics(@Res() res: Response) {
    await this.appService.metrics(res)
  }

  @Get('/dashboard')
  @UseGuards(JwtAuthGuard)
  async dashboard(@Req() req: Request, @Res() res: Response) {
    await this.appService.dashboard(res, req)
  }
}
