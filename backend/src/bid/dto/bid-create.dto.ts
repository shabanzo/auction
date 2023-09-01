import { IsNotEmpty, IsNumber, IsPositive } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class BidCreateDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  itemId: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  amount: number;
}
