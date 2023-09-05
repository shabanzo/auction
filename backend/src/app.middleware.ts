import { NextFunction, Request, Response } from 'express';
import { User } from 'user/user.entity';

import { HttpException, HttpStatus, Injectable, NestMiddleware } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { UserService } from './user/user.service';

export interface UserRequest extends Request {
  user: User;
}

@Injectable()
export class isAuthenticated implements NestMiddleware {
  constructor(
    private readonly jwt: JwtService,
    private readonly userService: UserService,
  ) {}
  async use(req: UserRequest, _res: Response, next: NextFunction) {
    try {
      if (
        req.cookies &&
        req.cookies.accessToken
      ) {
        const token = req.cookies.accessToken;
        const decoded = await this.jwt.verify(token);
        const user = await this.userService.findByEmail(decoded.email);
        if (user) {
          req.user = user;
          next();
        } else {
          throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
        }
      } else {
        throw new HttpException('No token found', HttpStatus.NOT_FOUND);
      }
    } catch {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }
  }
}
