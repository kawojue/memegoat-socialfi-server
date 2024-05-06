import { Request } from 'express'
import { Injectable } from '@nestjs/common'
import { Strategy } from 'passport-twitter'
import { AppService } from 'src/app.service'
import { PassportStrategy } from '@nestjs/passport'

@Injectable()
export class XStrategy extends PassportStrategy(Strategy) {
    constructor(private appService: AppService) {
        super({
            consumerKey: process.env.X_API_KEY,
            consumerSecret: process.env.X_API_SECRET,
            callbackURL: '/auth/x/callback',
            passReqToCallback: true,
        })
    }

    async validate(req: any, accessToken: string, refreshToken: string, profile: any, done: Function) {
        const user = {
            accessToken,
            refreshToken,
            profile,
        }
        done(null, user)
    }
}
