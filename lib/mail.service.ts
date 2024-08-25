import { SendMailClient } from 'zeptomail'
import { Injectable } from '@nestjs/common'

@Injectable()
export class MailService {
    async sendZeptoEmail(data: ZeptomailConfig) {
        try {
            const url = 'api.zeptomail.com/'
            const token = process.env.ZOHO_TOKEN
            const zohoClient = new SendMailClient({ url, token })
            const message = {
                bounce_address: 'bounce.zem@memegoat.io',
                from: {
                    address: data?.from,
                    name: data?.fromName || 'MemeGoat',
                },
                to: Array.isArray(data.to)
                    ? data.to.map((email) => ({ email_address: { address: email } }))
                    : [{ email_address: { address: data.to } }],
                ...(data?.dynamicData && { merge_info: data?.dynamicData }),
                subject: data?.subject,
                htmlbody: data?.html,
                ...(data?.attachments
                    ? {
                        attachments: Array.isArray(data.attachments)
                            ? data.attachments
                            : [data.attachments],
                    }
                    : {}),
            }
            const response = await zohoClient.sendMail(message)

            return response
        } catch (err) {
            console.error(err)
        }
    }
}
