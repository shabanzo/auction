import { IsDateString, IsOptional } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class ItemPublishDto {
  @ApiProperty()
  @IsDateString()
  @IsOptional()
  publishedAt?: string;
}
