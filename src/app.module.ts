import { Module } from '@nestjs/common'
import { APP_GUARD } from '@nestjs/core'
import { JwtService } from '@nestjs/jwt'
import { AppService } from './app.service'
import { JwtModule } from './jwt/jwt.module'
import { TaskService } from 'lib/task.service'
import { AppController } from './app.controller'
import { PassportModule } from '@nestjs/passport'
import { ScheduleModule } from '@nestjs/schedule'
// import { JwtAuthGuard } from './jwt/jwt-auth.guard'
import { PrismaService } from 'prisma/prisma.service'
import { ResponseService } from 'lib/response.service'
import { SessionSerializer } from './jwt/session.serialize'

@Module({
  imports: [
    JwtModule,
    // ScheduleModule.forRoot(),
    PassportModule.register({ defaultStrategy: 'twitter' }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // {
    //   provide: APP_GUARD,
    //   useClass: JwtAuthGuard,
    // },
    JwtService,
    TaskService,
    PrismaService,
    ResponseService,
    SessionSerializer,
  ],
})

export class AppModule { }