import { Injectable } from '@nestjs/common'
import { Request, Response } from 'express'
import { StatusCodes } from 'enums/statusCodes'
import { PrismaService } from 'prisma/prisma.service'
import { ResponseService } from 'lib/response.service'

@Injectable()
export class LeaderboardService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly response: ResponseService,
    ) { }

    async auth(res: Response, req: Request) {
        console.log(req)

        this.response.sendSuccess(res, StatusCodes.OK, {})
    }

    async fetchLeaderboard(res: Response) {

    }
}
