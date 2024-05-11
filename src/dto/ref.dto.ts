import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString } from 'class-validator'


export class RefDTO {
    @ApiProperty({
        example: 'kawojue_'
    })
    @IsString()
    @IsNotEmpty()
    username: string
}