import { UserRequest } from 'app.middleware';

import { Body, Controller, HttpCode, HttpStatus, Post, Req } from '@nestjs/common';

import { UserDepositDto } from './dto/user-deposit.dto';
import { UserSigninDto } from './dto/user-signin.dto';
import { UserSignupDto } from './dto/user-signup.dto';
import { UserService } from './user.service';

@Controller('/api/v1/user')
export class UserController {
  constructor(
    private readonly userService: UserService
  ) { }

  @Post('/signup')
  @HttpCode(HttpStatus.CREATED)
  async Signup(@Body() userSignupDto: UserSignupDto): Promise<any> {
    const result = await this.userService.signup(userSignupDto);
    return result;
  }

  @Post('/signin')
  @HttpCode(HttpStatus.OK)
  async Signin(@Body() userSigninDto: UserSigninDto): Promise<any> {
    const result = await this.userService.signin(userSigninDto);
    return result;
  }

  @Post('/deposit')
  @HttpCode(HttpStatus.OK)
  async Deposit(@Req() req: UserRequest, @Body() depositDto: UserDepositDto): Promise<any> {
    const result = await this.userService.deposit(req.user, depositDto)
    return result;
  }
}

