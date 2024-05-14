import { Response } from 'express'
import { AuthDTO } from './dto/auth.dto'
import {
  Body, Controller, Get, Post, Res, UseGuards
} from '@nestjs/common'
import { AdminService } from './admin.service'
import { SettingsDTO } from './dto/settings.dto'
import { JwtAuthGuard } from 'src/jwt/jwt-auth.guard'

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) { }

  async signup(@Res() res: Response, @Body() body: AuthDTO) {
    await this.adminService.signup(res, body)
  }

  async login(@Res() res: Response, @Body() body: AuthDTO) {
    await this.adminService.login(res, body)
  }

  @Get('/settings')
  @UseGuards(JwtAuthGuard)
  async fetchSettings(@Res() res: Response) {
    await this.adminService.fetchSettings(res)
  }

  @Post('settings/toggle-campaign')
  @UseGuards(JwtAuthGuard)
  async toggleCampaign(@Res() res: Response) {
    await this.adminService.toggleCampaign(res)
  }

  @Post('/settings')
  @UseGuards(JwtAuthGuard)
  async tweakSettings(@Res() res: Response, @Body() body: SettingsDTO) {
    await this.adminService.tweakSettings(res, body)
  }
}
