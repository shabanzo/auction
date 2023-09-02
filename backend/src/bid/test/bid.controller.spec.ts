import { UserRequest } from 'app.middleware';
import { Item } from 'item/item.entity';

import { Test, TestingModule } from '@nestjs/testing';

import { BidController } from '../bid.controller';
import { Bid } from '../bid.entity';
import { BidService } from '../bid.service';
import { BidCreateDto } from '../dto/bid-create.dto';

const mockUserRequest: UserRequest = {
  user: { id: 1 }, // Mock user object
} as UserRequest;

const mockBidService = {
  findAllByItem: jest.fn(),
  create: jest.fn(),
};

const item: Item = {
  id: 1,
  name: 'Item 1',
  startingPrice: 10,
  currentPrice: 10,
  timeWindowHours: 24,
  publishedAt: new Date(),
  user: mockUserRequest.user,
  bids: [],
};

describe('BidController (Integration)', () => {
  let bidController: BidController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BidController],
      providers: [
        {
          provide: BidService,
          useValue: mockBidService,
        },
      ],
    }).compile();

    bidController = module.get<BidController>(BidController);
  });

  it('should be defined', () => {
    expect(bidController).toBeDefined();
  });

  describe('getBids', () => {
    it('should return bids by item ID', async () => {
      const bids: Bid[] = [
        { id: 1, item, user: mockUserRequest.user, amount: 50 },
        { id: 2, item, user: mockUserRequest.user, amount: 60 },
      ];
      mockBidService.findAllByItem.mockResolvedValue(bids);

      const result = await bidController.getBids(item.id);

      expect(mockBidService.findAllByItem).toHaveBeenCalledWith(item.id);
      expect(result).toEqual(bids);
    });
  });

  describe('create', () => {
    it('should create a new bid', async () => {
      const bidCreateDto: BidCreateDto = { itemId: 123, amount: 75 };
      const createdBid: Bid = {
        id: 3,
        item: item,
        amount: bidCreateDto.amount,
        user: mockUserRequest.user,
      };
      mockBidService.create.mockResolvedValue(createdBid);

      const result = await bidController.create(mockUserRequest, bidCreateDto);

      expect(mockBidService.create).toHaveBeenCalledWith(
        mockUserRequest.user,
        bidCreateDto,
      );
      expect(result).toEqual(createdBid);
    });
  });
});
