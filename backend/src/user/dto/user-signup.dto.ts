import { IsNotEmpty, Matches } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

import { UserDto } from './user.dto';

const passwordRegEx =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/;

const passwordMessage = `Password must contain Minimum 8 and maximum 20 characters,
    at least one uppercase letter,
    one lowercase letter,
    one number and
    one special character`;
export class UserSignupDto extends UserDto {
  @ApiProperty({
    example: 'Password!1',
    description: passwordMessage,
  })
  @IsNotEmpty()
  @Matches(passwordRegEx, {
    message: passwordMessage,
  })
  password: string;
}
