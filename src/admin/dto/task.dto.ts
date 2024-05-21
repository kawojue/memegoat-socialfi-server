import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString } from 'class-validator'

export class AddTaskDTO {
    @ApiProperty({
        example: 'Mehn!'
    })
    @IsString()
    @IsNotEmpty()
    content: string
}