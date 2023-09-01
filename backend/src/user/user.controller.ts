import { UserRequest } from 'app.middleware';

import { Body, Controller, HttpCode, HttpStatus, Post, Req } from '@nestjs/common';
import {
    ApiBearerAuth, ApiConflictResponse, ApiCreatedResponse, ApiOkResponse, ApiTags,
    ApiUnauthorizedResponse
} from '@nestjs/swagger';

import { UserDepositDto } from './dto/user-deposit.dto';
import { UserSigninDto } from './dto/user-signin.dto';
import { UserSignupDto } from './dto/user-signup.dto';
import { UserService } from './user.service';

@ApiTags('Users')
@Controller('/api/v1/user')
export class UserController {
  constructor(
    private readonly userService: UserService
  ) { }

  @Post('/signup')
  @ApiCreatedResponse({ description: 'User created successfully' })
  @ApiConflictResponse({ description: 'The email already exists' })
  @HttpCode(HttpStatus.CREATED)
  async Signup(@Body() userSignupDto: UserSignupDto): Promise<any> {
    const result = await this.userService.signup(userSignupDto);
    return result;
  }

  @Post('/signin')
  @ApiOkResponse({ description: 'User authenticated successfully' })
  @ApiUnauthorizedResponse({ description: 'Incorrect username or password' })
  @HttpCode(HttpStatus.OK)
  async Signin(@Body() userSigninDto: UserSigninDto): Promise<any> {
    const result = await this.userService.signin(userSigninDto);
    return result;
  }

  @Post('/deposit')
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Deposit successful' })
  @ApiUnauthorizedResponse({ description: 'You are not authorized' })
  @HttpCode(HttpStatus.OK)
  async Deposit(@Req() req: UserRequest, @Body() depositDto: UserDepositDto): Promise<any> {
    const result = await this.userService.deposit(req.user, depositDto);
    return result;
  }
}
