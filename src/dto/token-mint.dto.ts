import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class TokenMintDTO {
  @ApiProperty({ example: '0x123abc...', description: 'User address' })
  @IsOptional()
  @IsString()
  user_addr?: string;

  @ApiProperty({
    example: 'https://example.com/token.jpg',
    description: 'Token image URL',
  })
  @IsOptional()
  @IsString()
  token_image?: string;

  @ApiProperty({ example: 'TokenName', description: 'Name of the token' })
  @IsOptional()
  @IsString()
  token_name?: string;

  @ApiProperty({
    example: 'This is a description of the token.',
    description: 'Description of the token',
  })
  @IsOptional()
  @IsString()
  token_desc?: string;

  @ApiProperty({ example: '1000000', description: 'Total supply of the token' })
  @IsOptional()
  @IsString()
  token_supply?: string;

  @ApiProperty({ example: 'TKN', description: 'Ticker of the token' })
  @IsOptional()
  @IsString()
  token_ticker?: string;

  @ApiProperty({ example: '0xabc123...', description: 'Token address' })
  @IsString()
  token_address: string;
}
