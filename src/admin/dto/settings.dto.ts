import {
    IsArray, IsBoolean, IsNumber, IsString
} from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class SettingsDTO {
    @ApiProperty({
        example: 3
    })
    @IsNumber()
    point: number

    @ApiProperty({
        example: false
    })
    @IsBoolean()
    campaign: boolean

    @ApiProperty({
        example: ['$goat', '@GoatStx']
    })
    @IsArray()
    tags: string[]

    @ApiProperty({
        example: 7
    })
    @IsNumber()
    days: number

    @ApiProperty({
        example: "1765374788577398784"
    })
    @IsString()
    profileId: string
}