import { JwtService } from '@nestjs/jwt'
import {
    Injectable, CanActivate, ExecutionContext
} from '@nestjs/common'
import { PrismaService } from 'prisma/prisma.service'

@Injectable()
export class JwtAuthGuard implements CanActivate {
    constructor(
        private readonly prisma: PrismaService,
        private readonly jwtService: JwtService,
    ) { }

    async canActivate(context: ExecutionContext) {
        const ctx = context.switchToHttp()
        const request = ctx.getRequest()

        const token = request.headers.authorization?.split('Bearer ')[1]
        if (!token) return false

        try {
            const decoded = await this.jwtService.verifyAsync(token, {
                secret: process.env.JWT_SECRET!
            })

            this.prisma.admin.findUnique({
                where: { id: decoded.sub }
            }).then((res) => {
                if (!res) {
                    return false
                }
            }).catch(() => {
                return false
            })
            request.user = decoded
            return true
        } catch (err) {
            console.error(err)
            return false
        }
    }
}
