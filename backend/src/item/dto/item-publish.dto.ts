import { IsNotEmpty, IsNumber } from 'class-validator';

export class ItemPublishDto {
  @IsNotEmpty()
  @IsNumber()
  itemId: number;
}
