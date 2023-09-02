import { IsDateString, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class ItemUpdateDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty()
  @IsNumber()
  @IsPositive()
  @IsOptional()
  startingPrice?: number;

  @ApiProperty()
  @IsNumber()
  @IsPositive()
  @IsOptional()
  timeWindowHours?: number;

  @ApiProperty()
  @IsDateString()
  @IsOptional()
  publishedAt?: string;
}
