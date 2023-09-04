import { BidCreateDto } from 'bid/dto/bid-create.dto';

import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { Item } from '../../item/item.entity';
import { User } from '../../user/user.entity';
import { Bid } from '../bid.entity';
import { BidService } from '../bid.service';

const mockBidRepository = {
  create: jest.fn(),
  save: jest.fn(),
  createQueryBuilder: jest.fn(),
};

const mockItemRepository = {
  findOneBy: jest.fn(),
  update: jest.fn(),
};

const mockUserRepository = {
  update: jest.fn(),
};

const mockCacheService = {
  get: jest.fn(),
  set: jest.fn(),
};

const user: User = { id: 1, walletBalance: 1000 } as User;
const item: Item = { id: 2, currentPrice: 40, bids: [] } as Item;

const bidDto: BidCreateDto = { itemId: 2, amount: 50 };
const newBid = { ...bidDto, item, user };
const createdBid: Bid = { ...bidDto, id: 1, user, item };

describe('BidService', () => {
  let bidService: BidService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
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
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheService,
        },
      ],
    }).compile();

    bidService = module.get<BidService>(BidService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(bidService).toBeDefined();
  });

  describe('create', () => {
    it('should create and return a bid', async () => {
      mockItemRepository.findOneBy.mockResolvedValue(item);
      mockCacheService.get.mockResolvedValue(undefined);
      mockBidRepository.create.mockReturnValue(newBid);
      mockBidRepository.save.mockResolvedValue(createdBid);

      const result = await bidService.create(user, bidDto);

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
      expect(mockUserRepository.update).toHaveBeenCalledWith(user, {
        walletBalance: user.walletBalance - bidDto.amount,
      });
      expect(result).toEqual(createdBid);
    });

    it('should throw NotFoundException if item is not found', async () => {
      mockItemRepository.findOneBy.mockResolvedValue(undefined);

      await expect(bidService.create(user, bidDto)).rejects.toThrowError(
        NotFoundException,
      );

      expect(mockItemRepository.findOneBy).toHaveBeenCalledWith({
        id: bidDto.itemId,
      });
      expect(mockCacheService.get).toHaveBeenCalledWith(
        `u${user.id}i${bidDto.itemId}`,
      );

      expect(mockBidRepository.create).not.toHaveBeenCalled();
      expect(mockBidRepository.save).not.toHaveBeenCalled();
      expect(mockCacheService.set).not.toHaveBeenCalled();
      expect(mockItemRepository.update).not.toHaveBeenCalledWith();
      expect(mockUserRepository.update).not.toHaveBeenCalledWith();
    });

    it('should throw UnprocessableEntityException if bid amount is lower than current price', async () => {
      const newItem: Item = { id: 2, currentPrice: 50 } as Item;
      const newBidDto: BidCreateDto = { itemId: 2, amount: 40 };

      mockItemRepository.findOneBy.mockResolvedValue(newItem);

      await expect(bidService.create(user, newBidDto)).rejects.toThrowError(
        UnprocessableEntityException,
      );

      expect(mockItemRepository.findOneBy).toHaveBeenCalledWith({
        id: newBidDto.itemId,
      });
      expect(mockCacheService.get).toHaveBeenCalledWith(
        `u${user.id}i${newBidDto.itemId}`,
      );
      expect(mockBidRepository.create).not.toHaveBeenCalled();
      expect(mockBidRepository.save).not.toHaveBeenCalled();
      expect(mockCacheService.set).not.toHaveBeenCalled();
      expect(mockItemRepository.update).not.toHaveBeenCalledWith();
      expect(mockUserRepository.update).not.toHaveBeenCalledWith();
    });

    it('should throw UnprocessableEntityException if bid is placed within 5 seconds', async () => {
      mockItemRepository.findOneBy.mockResolvedValue(item);
      mockCacheService.get.mockResolvedValue(true);

      jest.spyOn(mockCacheService, 'set').mockResolvedValue(undefined);

      await expect(bidService.create(user, bidDto)).rejects.toThrowError(
        UnprocessableEntityException,
      );

      expect(mockCacheService.get).toHaveBeenCalledWith(
        `u${user.id}i${bidDto.itemId}`,
      );
      expect(mockCacheService.set).not.toHaveBeenCalled();
      expect(mockItemRepository.findOneBy).not.toHaveBeenCalled();
      expect(mockBidRepository.create).not.toHaveBeenCalled();
      expect(mockBidRepository.save).not.toHaveBeenCalled();
      expect(mockUserRepository.update).not.toHaveBeenCalledWith();
    });
  });
});
