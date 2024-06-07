import { Response } from 'express'
import { Injectable } from '@nestjs/common'
import { StatusCodes } from 'enums/statusCodes'
import { ResponseService } from './response.service'

@Injectable()
export class MiscService {
    private response: ResponseService

    constructor() {
        this.response = new ResponseService()
    }

    handleServerError(res: Response, err?: any, msg?: string) {
        console.error(err)
        this.response.sendError(res, StatusCodes.InternalServerError, msg || err?.message || 'Something went wrong')
    }
}