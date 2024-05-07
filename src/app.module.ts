import { Module } from '@nestjs/common'
import { JwtModule, JwtService } from '@nestjs/jwt'
import { AppService } from './app.service'
import { TaskService } from 'lib/task.service'
import { AuthModule } from './auth/auth.module'
import { AppController } from './app.controller'
import { PrismaService } from 'prisma/prisma.service'
import { ResponseService } from 'lib/response.service'
import { SessionSerializer } from './jwt/session.serialize'
import { PassportModule } from '@nestjs/passport'

@Module({
  imports: [
    AuthModule,
    // ScheduleModule.forRoot(),
    JwtModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    JwtService,
    TaskService,
    PrismaService,
    ResponseService,
    SessionSerializer,
  ],
})

export class AppModule { }