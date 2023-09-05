import { isAuthenticated } from 'app.middleware';
import { BidCompletedProcessor } from 'bid-queue/bid-completed.processor';
import { BidController } from 'bid/bid.controller';
import { Bid } from 'bid/bid.entity';
import { BidService } from 'bid/bid.service';
import { redisStore } from 'cache-manager-redis-yet';
import { ItemController } from 'item/item.controller';
import { Item } from 'item/item.entity';
import { ItemService } from 'item/item.service';
import { UserController } from 'user/user.controller';
import { User } from 'user/user.entity';
import { UserService } from 'user/user.service';
import { secret } from 'utils/constants';

import { BullAdapter } from '@bull-board/api/bullAdapter';
import { ExpressAdapter } from '@bull-board/express';
import { BullBoardModule } from '@bull-board/nestjs';
import { BullModule } from '@nestjs/bull';
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
    BullBoardModule.forRoot({
      route: '/queues',
      adapter: ExpressAdapter,
    }),
    BullBoardModule.forFeature({
      name: 'bid-queue',
      adapter: BullAdapter,
    }),
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT),
      },
    }),
    BullModule.registerQueue({
      name: 'bid-queue',
    }),
    CacheModule.register({
      isGlobal: true,
      useFactory: () => ({
        store: redisStore({
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
    TypeOrmModule.forFeature([User, Item, Bid]),
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
  ],
  controllers: [AppController, UserController, ItemController, BidController],
  providers: [
    AppService,
    UserService,
    ItemService,
    BidService,
    BidCompletedProcessor,
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(isAuthenticated)
      .exclude(
        { path: 'api/v1/user/signin', method: RequestMethod.POST },
        { path: 'api/v1/user/signup', method: RequestMethod.POST },
        { path: 'api/v1/user/signout', method: RequestMethod.POST },
      )
      .forRoutes(UserController, ItemController, BidController);
  }
}
