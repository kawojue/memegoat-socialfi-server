import { Response } from 'express'
import { JwtService } from '@nestjs/jwt'
import { AuthDTO } from './dto/auth.dto'
import { Injectable } from '@nestjs/common'
import { AddTaskDTO } from './dto/task.dto'
import { StatusCodes } from 'enums/statusCodes'
import { SettingsDTO } from './dto/settings.dto'
import { Encryption } from 'lib/encryption.service'
import { PrismaService } from 'prisma/prisma.service'
import { ResponseService } from 'lib/response.service'

@Injectable()
export class AdminService {
    constructor(
        private readonly jwt: JwtService,
        private readonly prisma: PrismaService,
        private readonly encryption: Encryption,
        private readonly response: ResponseService,
    ) { }

    async signup(res: Response, { email, password }: AuthDTO) {
        try {
            email = email.toLowerCase().trim()

            const admin = await this.prisma.admin.findUnique({
                where: { email }
            })

            if (admin) {
                return this.response.sendError(res, StatusCodes.Conflict, "Warning! Existing admin")
            }

            password = await this.encryption.hashAsync(password, 12)

            await this.prisma.admin.create({
                data: { email, password }
            })

            this.response.sendSuccess(res, StatusCodes.Created, { message: "Successful" })
        } catch (err) {
            console.error(err)
            this.response.sendError(res, StatusCodes.InternalServerError, "Something went wrong")
        }
    }

    async login(res: Response, { email, password }: AuthDTO) {
        try {
            email = email.toLowerCase().trim()

            const admin = await this.prisma.admin.findUnique({
                where: { email }
            })

            if (!admin) {
                return this.response.sendError(res, StatusCodes.NotFound, "Invalid email or password")
            }

            const isMatch = await this.encryption.compareAsync(password, admin.password)
            if (!isMatch) {
                return this.response.sendError(res, StatusCodes.Unauthorized, "Incorrect password")
            }

            const access_token = await this.jwt.signAsync({ sub: admin.id })

            this.response.sendSuccess(res, StatusCodes.OK, { data: { email }, access_token })
        } catch (err) {
            console.error(err)
            this.response.sendError(res, StatusCodes.InternalServerError, "Something went wrong")
        }
    }

    async fetchSettings(res: Response) {
        const settings = await this.prisma.settings.findFirst()

        this.response.sendSuccess(res, StatusCodes.OK, { data: settings })
    }

    async tweakSettings(
        res: Response,
        {
            point, days, tags,
            campaign, profileId,
        }: SettingsDTO
    ) {
        try {
            const settings = await this.prisma.settings.findFirst()

            if (point === undefined || point === null) {
                point = settings.point
            }

            if (!days) {
                days = settings.days
            }

            if (campaign === undefined || campaign === null) {
                campaign = settings.hasTurnedOffCampaign
            }

            if (!profileId) {
                profileId = settings.profileId
            }

            if (!tags?.length && tags.length !== 0) {
                tags = settings.tags
            }

            const updatedSettings = await this.prisma.settings.update({
                where: { id: settings.id },
                data: {
                    point, days, tags, profileId,
                    hasTurnedOffCampaign: campaign
                }
            })

            this.response.sendSuccess(res, StatusCodes.OK, { data: updatedSettings })
        } catch (err) {
            console.error(err)
            this.response.sendError(res, StatusCodes.InternalServerError, "Something went wrong")
        }
    }

    async removeTask(res: Response, taskId: string) {
        const task = await this.prisma.task.findUnique({
            where: { id: taskId }
        })

        if (!task) {
            return this.response.sendError(res, StatusCodes.NotFound, "Task not found")
        }

        await this.prisma.task.delete({
            where: { id: taskId }
        })

        this.response.sendSuccess(res, StatusCodes.OK, {})
    }

    async addTask(res: Response, { content }: AddTaskDTO) {
        const task = await this.prisma.task.create({
            data: { content }
        })

        this.response.sendSuccess(res, StatusCodes.OK, { data: task })
    }
}
