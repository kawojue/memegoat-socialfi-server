import { Module } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { AdminService } from './admin.service'
import { JwtModule } from 'src/jwt/jwt.module'
import { Encryption } from 'lib/encryption.service'
import { AdminController } from './admin.controller'
import { PrismaService } from 'prisma/prisma.service'
import { ResponseService } from 'lib/response.service'

@Module({
  imports: [JwtModule],
  controllers: [AdminController],
  providers: [AdminService, JwtService, PrismaService, ResponseService, Encryption],
})
export class AdminModule { }
