import { Module } from '@nestjs/common'
import { XStrategy } from './x.strategy'
import { JwtModule as NestJwtModule } from '@nestjs/jwt'

@Module({
    imports: [
        NestJwtModule.register({
            secret: process.env.JWT_SECRET!,
            signOptions: { expiresIn: '7d' },
        }),
    ],
    providers: [XStrategy],
    exports: [NestJwtModule],
})
export class JwtModule { }