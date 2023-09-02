import { IsNotEmpty, IsNumber, IsPositive } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class UserDepositDto {
  @ApiProperty({
    example: '500.00',
  })
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  amount: number;
}
