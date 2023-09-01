import { IsNotEmpty, IsNumber, IsPositive, IsString } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class ItemCreateDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  startingPrice: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  timeWindowHours: number;
}
