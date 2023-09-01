import { IsNotEmpty, IsString } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

import { UserDto } from './user.dto';

export class UserSigninDto extends UserDto {
  @ApiProperty({
    example: 'Password!1'
  })
  @IsNotEmpty()
  @IsString()
  password: string;
}
