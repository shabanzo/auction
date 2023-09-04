import { Repository, SelectQueryBuilder } from 'typeorm';

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { Bid } from '../../bid/bid.entity';
import { User } from '../../user/user.entity';
import { BidCompletedProcessor } from '../bid-completed.processor';

describe('BidCompletedProcessor', () => {
  let processor: BidCompletedProcessor;
  let bidRepository: Repository<Bid>;
  let userRepository: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BidCompletedProcessor,
        {
          provide: getRepositoryToken(Bid),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
      ],
    }).compile();

    processor = module.get<BidCompletedProcessor>(BidCompletedProcessor);
    bidRepository = module.get<Repository<Bid>>(getRepositoryToken(Bid));
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));

    jest.clearAllMocks();
  });

  describe('cancelFailedBids', () => {
    it('should cancel failed bids and complete the job', async () => {
      // Mock the necessary methods and data
      const mockBid = new Bid();
      mockBid.amount = 100;
      const mockUser = new User();
      mockUser.walletBalance = 200;
      mockBid.user = mockUser;

      jest.spyOn(bidRepository, 'createQueryBuilder').mockReturnValue({
        innerJoin: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockBid]),
      } as unknown as SelectQueryBuilder<Bid>);

      const updateSpy = jest
        .spyOn(userRepository, 'update')
        .mockResolvedValue({} as any);

      const job = {
        data: { itemId: 1 },
        complete: jest.fn(),
        fail: jest.fn(),
      };

      await processor.cancelFailedBids(job);

      expect(bidRepository.createQueryBuilder).toHaveBeenCalled();
      expect(updateSpy).toHaveBeenCalledWith(mockUser, { walletBalance: 300 });
      expect(job.complete).toHaveBeenCalled();
      expect(job.fail).not.toHaveBeenCalled();
    });
  });
});
