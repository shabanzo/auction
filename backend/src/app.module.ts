import { isAuthenticated } from 'app.middleware';
import { BidController } from 'bid/bid.controller';
import { Bid } from 'bid/bid.entity';
import { BidModule } from 'bid/bid.module';
import { redisStore } from 'cache-manager-redis-yet';
import { ItemController } from 'item/item.controller';
import { Item } from 'item/item.entity';
import { ItemModule } from 'item/item.module';
import { UserController } from 'user/user.controller';
import { User } from 'user/user.entity';
import { UserModule } from 'user/user.module';
import { secret } from 'utils/constants';

import { CacheModule } from '@nestjs/cache-manager';
import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: async () => ({
        store: await redisStore({
          socket: {
            host: process.env.REDIS_HOST,
            port: Number(process.env.REDIS_PORT),
          },
        }),
      }),
    }),
    ConfigModule.forRoot({ isGlobal: true }),
    JwtModule.register({
      secret: secret,
      signOptions: { expiresIn: '1h' },
    }),
    ThrottlerModule.forRoot({ limit: 10, ttl: 60 }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      database: process.env.DB_NAME,
      username: process.env.DB_USER,
      password: process.env.DB_PASS,
      synchronize: true,
      logging: true,
      entities: [User, Item, Bid],
    }),
    UserModule,
    ItemModule,
    BidModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(isAuthenticated)
      .exclude(
        { path: 'api/v1/user/signin', method: RequestMethod.POST },
        { path: 'api/v1/user/signup', method: RequestMethod.POST },
      )
      .forRoutes(UserController, ItemController, BidController);
  }
}
