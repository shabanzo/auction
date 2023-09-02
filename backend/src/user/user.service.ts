import * as bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';

import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';

import { UserDepositDto } from './dto/user-deposit.dto';
import { UserSigninDto } from './dto/user-signin.dto';
import { UserSignupDto } from './dto/user-signup.dto';
import { User } from './user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async signup(userDto: UserSignupDto): Promise<any> {
    const user = await this.userRepository.findOneBy({ email: userDto.email });

    if (user) {
      throw new HttpException('Email already exists', HttpStatus.CONFLICT);
    }

    const salt = await bcrypt.genSalt();
    const hash = await bcrypt.hash(userDto.password, salt);
    const reqBody = {
      email: userDto.email,
      password: hash,
      walletBalance: 0,
    };
    const newUser = await this.userRepository.create(reqBody);
    this.userRepository.save(newUser);
    return {
      id: newUser.id,
      email: newUser.email,
      walletBalance: newUser.walletBalance,
    };
  }

  async signin(userDto: UserSigninDto): Promise<any> {
    const user = await this.userRepository.findOneBy({ email: userDto.email });
    if (user && (await bcrypt.compare(userDto.password, user.password))) {
      const payload = { email: userDto.email };
      return {
        ...payload,
        walletBalance: user.walletBalance,
        token: this.jwtService.sign(payload),
      };
    }
    throw new HttpException(
      'Incorrect username or password',
      HttpStatus.UNAUTHORIZED,
    );
  }

  async findByEmail(email: string): Promise<User> {
    return this.userRepository.findOneBy({ email });
  }

  async deposit(user: User, depositDto: UserDepositDto): Promise<any> {
    user.walletBalance = depositDto.amount + Number(user.walletBalance);
    await this.userRepository.save(user);
    return {
      id: user.id,
      email: user.email,
      walletBalance: user.walletBalance,
    };
  }
}
