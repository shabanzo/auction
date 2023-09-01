import { IsNotEmpty, IsNumber, IsPositive, IsString } from 'class-validator';

export class ItemCreateDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  startingPrice: number;

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  timeWindowHours: number;
}
