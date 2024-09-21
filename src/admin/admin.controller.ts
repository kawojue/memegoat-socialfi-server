import { Response } from 'express';
import { AuthDTO } from './dto/auth.dto';
import { AddTaskDTO } from './dto/task.dto';
import { AdminService } from './admin.service';
import { SettingsDTO } from './dto/settings.dto';
import { JwtAuthGuard } from 'src/jwt/jwt-auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ProposalDTO } from './dto/proposal.dto';

@ApiTags('Admin')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // @Post('/signup')
  async signup(@Res() res: Response, @Body() body: AuthDTO) {
    await this.adminService.signup(res, body);
  }

  @Post('/login')
  async login(@Res() res: Response, @Body() body: AuthDTO) {
    await this.adminService.login(res, body);
  }

  @Get('/settings')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async fetchSettings(@Res() res: Response) {
    await this.adminService.fetchSettings(res);
  }

  @Post('/settings')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async tweakSettings(@Res() res: Response, @Body() body: SettingsDTO) {
    await this.adminService.tweakSettings(res, body);
  }

  @ApiBearerAuth()
  @Post('tasks/new')
  @UseGuards(JwtAuthGuard)
  async addTask(@Res() res: Response, @Body() body: AddTaskDTO) {
    await this.adminService.addTask(res, body);
  }

  @ApiBearerAuth()
  @Delete('/tasks/:taskId')
  @UseGuards(JwtAuthGuard)
  async removeTask(@Res() res: Response, @Param('taskId') taskId: string) {
    await this.adminService.removeTask(res, taskId);
  }

  @ApiBearerAuth()
  @Post('proposal/new')
  @UseGuards(JwtAuthGuard)
  async addProposal(@Res() res: Response, @Body() body: ProposalDTO) {
    await this.adminService.addProposal(res, body);
  }

  @ApiBearerAuth()
  @Post('proposal/:address')
  @UseGuards(JwtAuthGuard)
  async endProposal(@Res() res: Response, @Param('address') address: string) {
    await this.adminService.endProposal(res, address);
  }
}
