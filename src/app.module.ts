import { Module } from '@nestjs/common'
import { AppService } from './app.service'
import { XStrategy } from './jwt/x.strategy'
import { TaskService } from 'lib/task.service'
import { AppController } from './app.controller'
import { PassportModule } from '@nestjs/passport'
import { ScheduleModule } from '@nestjs/schedule'
import { PrismaService } from 'prisma/prisma.service'
import { ResponseService } from 'lib/response.service'
import { SessionSerializer } from './jwt/session.serialize'

@Module({
  imports: [
    // ScheduleModule.forRoot(),
    PassportModule.register({ defaultStrategy: 'twitter' })
  ],
  controllers: [AppController],
  providers: [
    AppService,
    XStrategy,
    TaskService,
    PrismaService,
    ResponseService,
    SessionSerializer,
  ],
})

export class AppModule { }
