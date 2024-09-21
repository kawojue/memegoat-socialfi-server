import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsArray } from 'class-validator';

export class LockerDTO {
  @ApiProperty({ example: '12345', description: 'Transaction ID' })
  @IsOptional()
  @IsString()
  tokenAddress?: string;

  @IsOptional()
  @IsString()
  tokenName?: string;

  @IsOptional()
  @IsString()
  tokenSymbol?: string;

  @IsOptional()
  @IsString()
  tokenImg?: string;
}

export class LockerDTOV2 {
  @IsString()
  contractAddress: string;

  @IsString()
  creator: string;

  @IsString()
  tokenAddress: string;

  @IsString()
  txId: string;

  @IsOptional()
  @IsString()
  tokenName?: string;

  @IsOptional()
  @IsString()
  tokenSymbol?: string;

  @IsOptional()
  @IsString()
  tokenImg?: string;
}

export class LockerDTOV3 {
  @IsString()
  contractAddress: string;

  @IsString()
  user: string;

  @IsString()
  tokenAddress: string;

  @IsString()
  txId: string;

  @IsArray()
  addresses: string[];

  @IsOptional()
  @IsString()
  tokenName?: string;

  @IsOptional()
  @IsString()
  tokenSymbol?: string;

  @IsOptional()
  @IsString()
  tokenImg?: string;
}
