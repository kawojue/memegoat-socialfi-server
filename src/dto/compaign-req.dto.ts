import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsDateString, IsBoolean } from 'class-validator';

export class CampaignRequestDTO {
  @ApiProperty({
    example: 'step1',
    description: 'Current step of the campaign',
  })
  @IsOptional()
  @IsString()
  step?: string;

  @ApiProperty({ example: '12345', description: 'Transaction ID' })
  @IsOptional()
  @IsString()
  tx_id?: string;

  @ApiProperty({ example: 'completed', description: 'Transaction status' })
  @IsOptional()
  @IsString()
  tx_status?: string;

  @ApiProperty({ example: 'create', description: 'Action being performed' })
  @IsOptional()
  @IsString()
  action?: string;

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

  @ApiProperty({ example: '0xabc123...', description: 'Launchpad address' })
  @IsString()
  launchpad_contract: string;

  @ApiProperty({
    example: 'https://tokenwebsite.com',
    description: 'Token website URL',
  })
  @IsOptional()
  @IsString()
  token_website?: string;

  @ApiProperty({
    example: '@tokenTwitter',
    description: 'Token Twitter handle',
  })
  @IsOptional()
  @IsString()
  twitter?: string;

  @ApiProperty({
    example: 'https://discord.com/invite/token',
    description: 'Token Discord URL',
  })
  @IsOptional()
  @IsString()
  discord?: string;

  @ApiProperty({ example: '500000', description: 'Campaign allocation' })
  @IsOptional()
  @IsString()
  campaign_allocation?: string;

  @ApiProperty({
    example: 'This is a description of the campaign.',
    description: 'Description of the campaign',
  })
  @IsOptional()
  @IsString()
  campaign_description?: string;

  @ApiProperty({
    example: '@campaignTwitter',
    description: 'Campaign Twitter handle',
  })
  @IsOptional()
  @IsString()
  campaign_twitter?: string;

  @ApiProperty({
    example: '#campaign #launch',
    description: 'Campaign hashtags',
  })
  @IsOptional()
  @IsString()
  campaign_hashtags?: string;

  @ApiProperty({ example: '200000', description: 'Listing allocation' })
  @IsOptional()
  @IsString()
  listing_allocation?: string;

  @ApiProperty({ example: '300000', description: 'Sale allocation' })
  @IsOptional()
  @IsString()
  sale_allocation?: string;

  @ApiProperty({
    example: 'This is a description of the sale.',
    description: 'Description of the sale',
  })
  @IsOptional()
  @IsString()
  sale_description?: string;

  @ApiProperty({ example: '1000000', description: 'Hard cap for the sale' })
  @IsOptional()
  @IsString()
  hard_cap?: string;

  @ApiProperty({ example: '500000', description: 'Soft cap for the sale' })
  @IsOptional()
  @IsString()
  soft_cap?: string;

  @ApiProperty({ example: '10000', description: 'Maximum amount one can buy' })
  @IsOptional()
  @IsString()
  maximum_buy?: string;

  @ApiProperty({ example: '100', description: 'Minimum amount one can buy' })
  @IsOptional()
  @IsString()
  minimum_buy?: string;

  @ApiProperty({
    example: 'false',
    description: 'if request is a campaign or not',
  })
  @IsBoolean()
  is_campaign: boolean;

  @ApiProperty({
    example: new Date(),
    description: 'Start date of the campaign',
  })
  @IsDateString()
  start_date: Date;

  @ApiProperty({
    example: new Date(2024, 8, 10),
    description: 'End date of the campaign',
  })
  @IsDateString()
  end_date: Date;
}
