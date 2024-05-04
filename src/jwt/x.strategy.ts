import { Request } from 'express'
import { Injectable } from '@nestjs/common'
import { Strategy } from 'passport-twitter'
import { AppService } from 'src/app.service'
import { PassportStrategy } from '@nestjs/passport'

@Injectable()
export class XStrategy extends PassportStrategy(Strategy, 'twitter') {
    constructor(private appService: AppService) {
        super({
            consumerKey: process.env.X_API_KEY,
            consumerSecret: process.env.X_API_SECRET,
            callbackURL: '/x/callback',
            passReqToCallback: true,
            failureRedirect: '/login'
        })
    }

    async validate(req: Request, token: string, tokenSecret: string, profile: any, done: any) {
        const user = await this.appService.auth(profile)
        done(null, user)
    }
}
