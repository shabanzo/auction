import { Repository, SelectQueryBuilder } from 'typeorm';

import { Process, Processor } from '@nestjs/bull';
import { InjectRepository } from '@nestjs/typeorm';

import { Bid } from '../bid/bid.entity';
import { User } from '../user/user.entity';

@Processor('bidQueue')
export class BidCompletedProcessor {
  constructor(
    @InjectRepository(Bid)
    private readonly bidRepository: Repository<Bid>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  @Process()
  async cancelFailedBids(job) {
    const queryBuilder: SelectQueryBuilder<Bid> = this.bidRepository
      .createQueryBuilder('bid')
      .innerJoin('bid.item', 'item')
      .leftJoinAndSelect('bid.user', 'user')
      .where('bid.item = :itemId', { itemId: job.data.itemId })
      .andWhere('item.currentPrice <> bid.amount');

    const bids = await queryBuilder.getMany();

    if (bids.length == 0) {
      return;
    }

    try {
      const updatePromises = bids.map(async (bid) => {
        const newBalance = Number(bid.user.walletBalance) + Number(bid.amount);
        await this.userRepository.update(bid.user, {
          walletBalance: newBalance,
        });
      });
      await Promise.all(updatePromises);
      console.log('Cancelling bids for item:', job.data.itemId);
      await job.complete();
    } catch (error) {
      await job.fail(new Error('Failed to cancel bids'));
    }
  }
}
