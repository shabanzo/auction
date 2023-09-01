import { IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';

export class ItemUpdateDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsNumber()
  @IsPositive()
  @IsOptional()
  startingPrice?: number;

  @IsNumber()
  @IsPositive()
  @IsOptional()
  timeWindowHours?: number;
}
