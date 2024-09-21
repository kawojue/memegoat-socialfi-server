import { IsArray, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ProposalDTO {
  @ApiProperty({
    example: 'SP1KSDG0XE...2EAPX3YM02 ',
  })
  @IsString()
  address: string;

  @ApiProperty({
    example: 'Increase Staking Rewards for Token Holders',
  })
  @IsString()
  title: string;

  @ApiProperty({
    example:
      'Should we lower the transaction fees on our platform by 2%? This would make transactions more affordable for all users',
  })
  @IsString()
  description: string;

  @ApiProperty({
    example: ['a', 'b', 'c', 'd'],
  })
  @IsArray()
  options: string[];
}
