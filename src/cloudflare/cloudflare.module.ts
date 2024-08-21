import { Module } from '@nestjs/common'
import { HttpModule } from '@nestjs/axios'
import { ApiService } from 'lib/api.service'
import { ResponseService } from 'lib/response.service'
import { CloudflareService } from './cloudflare.service'
import { CloudflareController } from './cloudflare.controller'

@Module({
  imports: [HttpModule],
  controllers: [CloudflareController],
  providers: [
    CloudflareService,
    ApiService,
    ResponseService,
  ],
  exports: [CloudflareService]
})
export class CloudflareModule { }
