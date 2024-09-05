import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class LockerDTO {
  @ApiProperty({ example: '12345', description: 'Transaction ID' })
  @IsOptional()
  @IsString()
  tokenAddress?: string;
}
