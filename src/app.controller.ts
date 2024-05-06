import { AppService } from './app.service'
import { Request, Response } from 'express'
import { AuthGuard } from '@nestjs/passport'
import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common'

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
    const user = await this.appService.auth(res, req)

    if (!user) {
      res.redirect('http://localhost:3000/login')
    } else {
      res.redirect('http://localhost:3000/challenges')
    }
  }

  @Get('/check')
  async check(@Res() res: Response) {
    await this.appService.check(res)
  }
}
