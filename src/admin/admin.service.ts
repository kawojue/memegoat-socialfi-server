import { Response } from 'express'
import { escape } from 'html-escaper'
import { JwtService } from '@nestjs/jwt'
import { AuthDTO } from './dto/auth.dto'
import { Injectable } from '@nestjs/common'
import { AddTaskDTO } from './dto/task.dto'
import { MiscService } from 'lib/misc.service'
import { StatusCodes } from 'enums/statusCodes'
import { SettingsDTO } from './dto/settings.dto'
import { Encryption } from 'lib/encryption.service'
import { PrismaService } from 'prisma/prisma.service'
import { ResponseService } from 'lib/response.service'

@Injectable()
export class AdminService {
    constructor(
        private readonly jwt: JwtService,
        private readonly misc: MiscService,
        private readonly prisma: PrismaService,
        private readonly encryption: Encryption,
        private readonly response: ResponseService,
    ) { }

    async signup(res: Response, { email, password }: AuthDTO) {
        try {
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
            this.misc.handleServerError(res, err)
        }
    }

    async login(res: Response, { email, password }: AuthDTO) {
        try {
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

            const access_token = await this.jwt.signAsync({ sub: admin.id }, {
                expiresIn: '1hr',
                secret: process.env.JWT_SECRET!
            })

            this.response.sendSuccess(res, StatusCodes.OK, { data: { email }, access_token })
        } catch (err) {
            this.misc.handleServerError(res, err)
        }
    }

    async fetchSettings(res: Response) {
        const settings = await this.prisma.settings.findFirst()

        this.response.sendSuccess(res, StatusCodes.OK, { data: settings })
    }

    async tweakSettings(
        res: Response,
        {
            point,
            days,
            tags,
            campaign,
            profileId,
        }: SettingsDTO
    ) {
        try {
            const settings = await this.prisma.settings.findFirst()

            if (!settings) {
                return this.response.sendError(res, StatusCodes.NotFound, "Settings not found")
            }

            point = point ?? settings.point
            days = days ?? settings.days
            profileId = profileId ?? settings.profileId

            if (!Array.isArray(tags)) {
                tags = settings.tags
            }

            let campaignedAt = settings.campaignedAt

            if (campaign !== undefined && campaign !== settings.hasTurnedOffCampaign) {
                campaignedAt = campaign ? null : new Date()
            }

            const updatedSettings = await this.prisma.settings.update({
                where: { id: settings.id },
                data: {
                    point,
                    days,
                    tags,
                    profileId,
                    campaignedAt,
                    hasTurnedOffCampaign: campaign,
                },
            })

            return this.response.sendSuccess(res, StatusCodes.OK, { data: updatedSettings })
        } catch (err) {
            this.misc.handleServerError(res, err, "Something went wrong while updating settings")
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
        try {
            const linkify = (text: string) => {
                const urlRegex = /((https?:\/\/[^\s]+))/g
                return text.replace(urlRegex, (url) => {
                    const escapedUrl = escape(url)
                    return `<a href="${escapedUrl}" style="text-decoration: underline">${escapedUrl}</a>`
                })
            }

            const escapedContent = escape(content)
            const contentWithLinks = linkify(escapedContent)
            const finalContent = `<p>${contentWithLinks}</p>`

            const task = await this.prisma.task.create({
                data: { content: finalContent }
            })

            this.response.sendSuccess(res, StatusCodes.OK, { data: task })
        } catch (err) {
            this.misc.handleServerError(res, err)
        }
    }

    async fetchCampaignRequests(res: Response) {
        const requests = await this.prisma.campaignRequest.findMany({
            orderBy: { createdAt: 'desc' }
        })

        this.response.sendSuccess(res, StatusCodes.OK, { data: requests })
    }

    async fetchCampaignRequest(res: Response, id: string) {
        const request = await this.prisma.campaignRequest.findUnique({
            where: { id }
        })

        if (!request) {
            this.response.sendError(res, StatusCodes.NotFound, "Campaign Request not found")
        }

        this.response.sendSuccess(res, StatusCodes.OK, { data: request })
    }
}
