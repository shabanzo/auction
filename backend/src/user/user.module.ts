import { secret } from 'utils/constants';

import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserController } from './user.controller';
import { User } from './user.entity';
import { UserService } from './user.service';

@Module({
  imports: [
    JwtModule.register({
      secret: secret,
      signOptions: { expiresIn: '1h' },
    }),
    TypeOrmModule.forFeature([User])
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
