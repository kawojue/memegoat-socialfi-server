import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AppService } from './app.service';
import { ApiService } from 'lib/api.service';
import { TaskService } from 'lib/task.service';
import { MiscService } from 'lib/misc.service';
import { MailService } from 'lib/mail.service';
import { AuthModule } from './auth/auth.module';
import { AppController } from './app.controller';
import { PlunkService } from 'lib/plunk.service';
import { ScheduleModule } from '@nestjs/schedule';
import { AdminModule } from './admin/admin.module';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PrismaService } from 'prisma/prisma.service';
import { ResponseService } from 'lib/response.service';
import { TxnVolumeService } from 'lib/txVolume.service';
import { SessionSerializer } from './jwt/session.serialize';
import { CloudflareModule } from './cloudflare/cloudflare.module';
import { ContractService } from 'lib/contract.service';
import { GoogleSheetsService } from 'lib/gsheet.service';
import { FeeVolumeService } from 'lib/feeVol.service';
import { PoolService } from 'lib/pool.service';

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
    MailService,
    PlunkService,
    PrismaService,
    ResponseService,
    TxnVolumeService,
    SessionSerializer,
    ContractService,
    GoogleSheetsService,
    FeeVolumeService,
    PoolService,
  ],
  exports: [AppService],
})
export class AppModule {}
