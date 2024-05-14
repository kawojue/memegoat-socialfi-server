import { Response } from 'express'
import { AuthDTO } from './dto/auth.dto'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import {
  Body, Controller, Get, Post, Res, UseGuards
} from '@nestjs/common'
import { AdminService } from './admin.service'
import { SettingsDTO } from './dto/settings.dto'
import { JwtAuthGuard } from 'src/jwt/jwt-auth.guard'

@ApiTags("Admin")
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) { }

  // @Post('/signup')
  async signup(@Res() res: Response, @Body() body: AuthDTO) {
    await this.adminService.signup(res, body)
  }

  @Post('/login')
  async login(@Res() res: Response, @Body() body: AuthDTO) {
    await this.adminService.login(res, body)
  }

  @Get('/settings')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async fetchSettings(@Res() res: Response) {
    await this.adminService.fetchSettings(res)
  }

  @Post('settings/toggle-campaign')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async toggleCampaign(@Res() res: Response) {
    await this.adminService.toggleCampaign(res)
  }

  @Post('/settings')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async tweakSettings(@Res() res: Response, @Body() body: SettingsDTO) {
    await this.adminService.tweakSettings(res, body)
  }
}
