import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

enum POOL {
  ALEX = 'ALEX',
  VELAR = 'VELAR',
}

export class ChartDTO {
  @ApiProperty({
    example: 'ALEX',
  })
  @IsEnum(POOL)
  @IsNotEmpty()
  pool: POOL;

  @ApiProperty({
    example: 'SP102V8P0F7JX67ARQ77WEA3D3CFB5XW39REDT0AM.token-alex',
  })
  @IsString()
  @IsNotEmpty()
  tokenA: string;

  @ApiProperty({
    example: 'SP2F4QC563WN0A0949WPH5W1YXVC4M1R46QKE0G14.memegoatstx',
  })
  @IsString()
  @IsNotEmpty()
  tokenB: string;
}
