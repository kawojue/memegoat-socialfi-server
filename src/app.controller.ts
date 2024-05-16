import {
  Res,
  UseGuards,
  ValidationPipe,
  Body,
  Controller,
  Get,
  Post,
  Req,
} from '@nestjs/common';
import { RefDTO } from './dto/ref.dto';
import { AppService } from './app.service';
import { SmartKeyDTO } from './dto/key.dto';
import { Request, Response } from 'express';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CookieAuthGuard } from './jwt/cookie-auth.guard';

@ApiTags('App')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('/leaderboard')
  async leaderboard(@Res() res: Response) {
    await this.appService.leaderboard(res);
  }

  @Get('/dashboard')
  @ApiBearerAuth()
  @UseGuards(CookieAuthGuard)
  async dashboard(@Req() req: Request, @Res() res: Response) {
    await this.appService.dashboard(res, req);
  }

  @Post('/verify/smartKey')
  async verifySmartKey(
    @Res() res: Response,
    @Body(ValidationPipe) body: SmartKeyDTO,
  ) {
    await this.appService.verifySmartKey(res, body);
  }

  @Post('/verify/referral')
  @ApiBearerAuth()
  @UseGuards(CookieAuthGuard)
  async verifyRef(
    @Req() req: Request,
    @Res() res: Response,
    @Body(ValidationPipe) body: RefDTO,
  ) {
    await this.appService.verifyRef(req, res, body);
  }
}
