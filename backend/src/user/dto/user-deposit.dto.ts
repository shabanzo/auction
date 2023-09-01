import { IsNotEmpty, IsNumber, IsPositive } from 'class-validator';

export class UserDepositDto {
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  amount: number;
}
