import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class UserSigninDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}
