import { Repository } from 'typeorm';

import { CACHE_MANAGER, CacheModule } from '@nestjs/cache-manager';
import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { Bid } from '../bid.entity';
import { BidService } from '../bid.service';

const mockBidRepository = {
  create: jest.fn(),
  save: jest.fn(),
  createQueryBuilder: jest.fn(),
};

const mockCacheService = {
  get: jest.fn(),
  set: jest.fn(),
};

describe('BidService', () => {
  let bidService: BidService;
  let bidRepository: Repository<Bid>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CacheModule.register()],
      providers: [
        BidService,
        {
          provide: getRepositoryToken(Bid),
          useValue: mockBidRepository,
        },
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheService,
        },
      ],
    }).compile();

    bidService = module.get<BidService>(BidService);
    bidRepository = module.get<Repository<Bid>>(getRepositoryToken(Bid));
  });

  it('should be defined', () => {
    expect(bidService).toBeDefined();
  });

  describe('create', () => {
    it('should create and return a bid', async () => {
      const user = { id: 1 };
      const bidDto = { itemId: 2, amount: 50 };
      const createdBid = { ...bidDto, id: 1 };

      mockCacheService.get.mockResolvedValue(undefined);
      mockBidRepository.create.mockReturnValue(bidDto);
      mockBidRepository.save.mockResolvedValue(createdBid);

      const result = await bidService.create(user as any, bidDto);

      expect(mockCacheService.get).toHaveBeenCalledWith(`u1i2`);
      expect(mockCacheService.set).toHaveBeenCalledWith(`u1i2`, true, 5);
      expect(mockBidRepository.create).toHaveBeenCalledWith(bidDto);
      expect(mockBidRepository.save).toHaveBeenCalledWith(expect.objectContaining(bidDto));
      expect(result).toEqual(createdBid);
    });

    it('should throw NotFoundException if bid is placed within 5 seconds', async () => {
      const user = { id: 1 };
      const bidDto = { itemId: 2, amount: 50 };

      mockCacheService.get.mockResolvedValue(true);

      jest.spyOn(mockCacheService, 'set').mockResolvedValue(undefined);

      await expect(bidService.create(user as any, bidDto)).rejects.toThrowError(NotFoundException);

      expect(mockCacheService.get).toHaveBeenCalledWith(`u1i2`);
      expect(mockCacheService.set).toHaveBeenCalled();

      jest.clearAllMocks();

      expect(mockCacheService.set).not.toHaveBeenCalled();
    });
  });
});
