import { Module } from '@nestjs/common'
import { APP_GUARD } from '@nestjs/core'
import { AppService } from './app.service'
import { XStrategy } from './jwt/x.strategy'
import { TaskService } from 'lib/task.service'
import { AppController } from './app.controller'
import { PassportModule } from '@nestjs/passport'
import { ScheduleModule } from '@nestjs/schedule'
import { JwtModule, JwtService } from '@nestjs/jwt'
import { JwtAuthGuard } from './jwt/jwt-auth.guard'
import { PrismaService } from 'prisma/prisma.service'
import { ResponseService } from 'lib/response.service'
import { SessionSerializer } from './jwt/session.serialize'

@Module({
  imports: [
    // ScheduleModule.forRoot(),
    PassportModule.register({ defaultStrategy: 'twitter' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET!,
      signOptions: { expiresIn: '7d' },
    })
  ],
  controllers: [AppController],
  providers: [
    AppService,
    XStrategy,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    JwtService,
    TaskService,
    PrismaService,
    ResponseService,
    SessionSerializer,
  ],
})

export class AppModule { }
