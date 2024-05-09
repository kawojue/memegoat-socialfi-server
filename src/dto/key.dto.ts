import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString } from 'class-validator'

export class SmartKeyDTO {
    @ApiProperty({
        example: ''
    })
    @IsString()
    @IsNotEmpty()
    username: string

    @ApiProperty({
        example: ''
    })
    @IsString()
    @IsNotEmpty()
    key: string
}