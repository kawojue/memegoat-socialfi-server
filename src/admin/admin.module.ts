import { Module } from '@nestjs/common'
import { AdminService } from './admin.service'
import { JwtModule } from 'src/jwt/jwt.module'
import { MiscService } from 'lib/misc.service'
import { Encryption } from 'lib/encryption.service'
import { AdminController } from './admin.controller'
import { PrismaService } from 'prisma/prisma.service'
import { ResponseService } from 'lib/response.service'

@Module({
  imports: [JwtModule],
  controllers: [AdminController],
  providers: [
    AdminService,
    Encryption,
    MiscService,
    PrismaService,
    ResponseService,
  ],
})
export class AdminModule { }
