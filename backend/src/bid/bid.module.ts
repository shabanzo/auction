import { Item } from 'item/item.entity';

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BidController } from './bid.controller';
import { Bid } from './bid.entity';
import { BidService } from './bid.service';

@Module({
  imports: [TypeOrmModule.forFeature([Bid, Item])],
  controllers: [BidController],
  providers: [BidService],
  exports: [BidService],
})
export class BidModule {}
