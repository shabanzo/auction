import { BidCreateDto } from 'bid/dto/bid-create.dto';
import { Cache } from 'cache-manager';
import { Repository } from 'typeorm';
import { User } from 'user/user.entity';

import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Bid } from './bid.entity';

@Injectable()
export class BidService {
  constructor(
    @InjectRepository(Bid)
    private readonly bidRepository: Repository<Bid>,
    @Inject(CACHE_MANAGER) private cacheService: Cache,
  ) {}

  async findAllByItem(itemId: number): Promise<Bid[]> {
    return this.bidRepository
      .createQueryBuilder('bid')
      .where('bid.itemId = :itemId', { itemId })
      .getMany();
  }

  async create(user: User, bidDto: BidCreateDto): Promise<Bid> {
    const cacheKey = `u${user.id}i${bidDto.itemId}`;
    const cache = await this.cacheService.get(cacheKey);

    if (cache) {
      throw new NotFoundException('You can place a bid once every 5 seconds.');
    }

    const bid = this.bidRepository.create(bidDto);

    await this.cacheService.set(cacheKey, true, 5);

    return this.bidRepository.save(bid);
  }
}
