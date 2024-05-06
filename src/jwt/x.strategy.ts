import { Request } from 'express'
import { Injectable } from '@nestjs/common'
import { Strategy } from 'passport-twitter'
import { PassportStrategy } from '@nestjs/passport'

@Injectable()
export class XStrategy extends PassportStrategy(Strategy) {
    constructor() {
        super({
            session: true,
            passReqToCallback: true,
            callbackURL: '/auth/x/callback',
            consumerKey: process.env.X_API_KEY,
            consumerSecret: process.env.X_API_SECRET,
        })
    }

    async validate(req: Request, accessToken: string, refreshToken: string, profile: any, done: CallableFunction) {
        const user = {
            accessToken,
            refreshToken,
            profile,
        }
        done(null, user)
    }
}
