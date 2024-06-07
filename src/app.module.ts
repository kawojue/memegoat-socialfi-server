import { Module } from '@nestjs/common'
import { AppService } from './app.service'
import { TaskService } from 'lib/task.service'
import { MiscService } from 'lib/misc.service'
import { AuthModule } from './auth/auth.module'
import { AppController } from './app.controller'
import { ScheduleModule } from '@nestjs/schedule'
import { AdminModule } from './admin/admin.module'
import { JwtModule, JwtService } from '@nestjs/jwt'
import { PrismaService } from 'prisma/prisma.service'
import { ResponseService } from 'lib/response.service'
import { SessionSerializer } from './jwt/session.serialize'

@Module({
  imports: [AuthModule, ScheduleModule.forRoot(), JwtModule, AdminModule],
  controllers: [AppController],
  providers: [
    AppService,
    JwtService,
    TaskService,
    MiscService,
    PrismaService,
    ResponseService,
    SessionSerializer,
  ],
})
export class AppModule { }
