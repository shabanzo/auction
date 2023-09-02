import { IsEmail, IsNotEmpty } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class UserDto {
  @ApiProperty({
    example: 'syaban@test.com',
    description: "It's mandatory to use a valid email format",
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;
}
