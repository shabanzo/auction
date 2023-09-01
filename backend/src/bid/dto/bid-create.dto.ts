import { IsNotEmpty, IsNumber, IsPositive } from 'class-validator';

export class BidCreateDto {
  @IsNumber()
  @IsNotEmpty()
  itemId: number;

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  amount: number;
}
