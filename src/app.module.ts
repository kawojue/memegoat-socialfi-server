import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AppService } from './app.service';
import { ApiService } from 'lib/api.service';
import { TaskService } from 'lib/task.service';
import { MiscService } from 'lib/misc.service';
import { AuthModule } from './auth/auth.module';
import { AppController } from './app.controller';
import { PlunkService } from 'lib/plunk.service';
import { ScheduleModule } from '@nestjs/schedule';
import { AdminModule } from './admin/admin.module';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PrismaService } from 'prisma/prisma.service';
import { ResponseService } from 'lib/response.service';
import { SessionSerializer } from './jwt/session.serialize';
import { CloudflareModule } from './cloudflare/cloudflare.module';

@Module({
  imports: [
    AuthModule,
    ScheduleModule.forRoot(),
    HttpModule,
    JwtModule,
    AdminModule,
    CloudflareModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    JwtService,
    ApiService,
    TaskService,
    MiscService,
    PlunkService,
    PrismaService,
    ResponseService,
    SessionSerializer,
  ],
  exports: [AppService]
})
export class AppModule { }
