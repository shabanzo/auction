import { IsNotEmpty, IsNumber } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class ItemPublishDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  itemId: number;
}
