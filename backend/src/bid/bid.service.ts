import { BidCreateDto } from 'bid/dto/bid-create.dto';
import { Cache } from 'cache-manager';
import { Repository } from 'typeorm';

import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  Inject,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Item } from '../item/item.entity';
import { User } from '../user/user.entity';
import { Bid } from './bid.entity';

@Injectable()
export class BidService {
  constructor(
    @InjectRepository(Bid)
    private readonly bidRepository: Repository<Bid>,
    @InjectRepository(Item)
    private readonly itemRepository: Repository<Item>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @Inject(CACHE_MANAGER) private cacheService: Cache,
  ) {}

  async create(user: User, bidDto: BidCreateDto): Promise<Bid> {
    const cacheKey = `u${user.id}i${bidDto.itemId}`;
    const cache = await this.cacheService.get(cacheKey);

    if (cache) {
      throw new UnprocessableEntityException(
        'You can place a bid once every 5 seconds.',
      );
    }

    const item = await this.itemRepository.findOneBy({ id: bidDto.itemId });

    if (!item) {
      throw new NotFoundException(`Item with ID ${bidDto.itemId} not found`);
    } else if (item.currentPrice >= bidDto.amount) {
      throw new UnprocessableEntityException(
        'Your bid lower than the current price.',
      );
    } else if (user.walletBalance < bidDto.amount) {
      throw new UnprocessableEntityException(
        'Your balance lower than the bid amount.',
      );
    }

    const newBid = {
      ...bidDto,
      item: item,
      user: user,
    };
    const bid = this.bidRepository.create(newBid);
    const createdBid = this.bidRepository.save(bid);
    await this.cacheService.set(cacheKey, true, 5);
    await this.itemRepository.update(item, { currentPrice: bidDto.amount });
    const newBalance = Number(user.walletBalance) - bidDto.amount;
    await this.userRepository.update(user, { walletBalance: newBalance });
    return createdBid;
  }
}
