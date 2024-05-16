import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { XStrategy } from 'src/jwt/x.strategy';
import { JwtModule } from 'src/jwt/jwt.module';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { PrismaService } from 'prisma/prisma.service';
import { SessionSerializer } from 'src/jwt/session.serialize';

@Module({
  imports: [JwtModule, PassportModule.register({ defaultStrategy: 'twitter' })],
  controllers: [AuthController],
  providers: [AuthService, XStrategy, SessionSerializer, PrismaService],
})
export class AuthModule {}
