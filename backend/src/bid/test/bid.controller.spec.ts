import { UserRequest } from 'app.middleware';
import { Repository } from 'typeorm';
import { User } from 'user/user.entity';

import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { Item } from '../../item/item.entity';
import { BidController } from '../bid.controller';
import { Bid } from '../bid.entity';
import { BidService } from '../bid.service';
import { BidCreateDto } from '../dto/bid-create.dto';

const mockUserRequest: UserRequest = {
  user: { id: 1 },
} as UserRequest;

const mockBidRepository = {
  create: jest.fn(),
  save: jest.fn(),
  createQueryBuilder: jest.fn(),
};

const mockItemRepository = {
  findOneBy: jest.fn(),
  update: jest.fn(),
};

const mockCacheService = {
  get: jest.fn(),
  set: jest.fn(),
};

describe('BidController (Integration)', () => {
  let bidController: BidController;
  let bidRepository: Repository<Bid>;
  let itemRepository: Repository<Item>;
  let cacheService: Cache;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BidController],
      providers: [
        BidService,
        {
          provide: getRepositoryToken(Bid),
          useValue: mockBidRepository,
        },
        {
          provide: getRepositoryToken(Item),
          useValue: mockItemRepository,
        },
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheService,
        },
      ],
    }).compile();

    bidController = module.get<BidController>(BidController);
    bidRepository = module.get<Repository<Bid>>(getRepositoryToken(Bid));
    itemRepository = module.get<Repository<Item>>(getRepositoryToken(Item));
    cacheService = module.get<Cache>(CACHE_MANAGER);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(bidController).toBeDefined();
  });

  describe('create', () => {
    const user: User = { id: 1 } as User;
    const item: Item = { id: 2, currentPrice: 40, bids: [] } as Item;
    const bidDto: BidCreateDto = { itemId: 2, amount: 50 };
    const newBid = { ...bidDto, item, user };
    const createdBid: Bid = { ...bidDto, id: 1, user, item };

    it('should create a new bid', async () => {
      mockItemRepository.findOneBy.mockResolvedValue(item);
      mockCacheService.get.mockResolvedValue(undefined);
      mockBidRepository.create.mockReturnValue(newBid);
      mockBidRepository.save.mockResolvedValue(createdBid);

      const result = await bidController.create(mockUserRequest, bidDto);

      expect(mockCacheService.get).toHaveBeenCalledWith(
        `u${user.id}i${bidDto.itemId}`,
      );
      expect(mockItemRepository.findOneBy).toHaveBeenCalledWith({
        id: bidDto.itemId,
      });
      expect(mockBidRepository.create).toHaveBeenCalledWith(newBid);
      expect(mockBidRepository.save).toHaveBeenCalledWith(newBid);
      expect(mockCacheService.set).toHaveBeenCalledWith(
        `u${user.id}i${bidDto.itemId}`,
        true,
        5,
      );
      expect(mockItemRepository.update).toHaveBeenCalledWith(item, {
        currentPrice: bidDto.amount,
      });
      expect(result).toEqual(createdBid);
    });
  });
});
