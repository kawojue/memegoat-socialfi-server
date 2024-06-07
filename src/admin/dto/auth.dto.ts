import { ApiProperty } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import { IsEmail, IsNotEmpty, MaxLength } from 'class-validator'

export class AuthDTO {
    @ApiProperty({
        example: 'kawojue08@gmail.com'
    })
    @IsEmail()
    @IsNotEmpty()
    @Transform(({ value }) => value.toLowerCase().trim())
    email: string

    @ApiProperty({
        example: 'mypswd123'
    })
    @MaxLength(32)
    @IsNotEmpty()
    password: string
}