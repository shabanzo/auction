import { UserRequest } from 'app.middleware';
import { Queue } from 'bull';
import { User } from 'user/user.entity';

import { getQueueToken } from '@nestjs/bull';
import { Test, TestingModule } from '@nestjs/testing';

import { ItemCreateDto } from '../dto/item-create.dto';
import { ItemPublishDto } from '../dto/item-publish.dto';
import { ItemController } from '../item.controller';
import { Item } from '../item.entity';
import { ItemService, PaginateItems } from '../item.service';

const mockUserRequest: UserRequest = {
  user: { id: 1 },
} as UserRequest;

const mockItemService = {
  findAllByUser: jest.fn(),
  findAllPublishedItems: jest.fn(),
  create: jest.fn(),
  publish: jest.fn(),
};

const mockBidQueue = {
  add: jest.fn(),
};

describe('ItemController', () => {
  let itemController: ItemController;
  let bidQueue: Queue;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ItemController],
      providers: [
        {
          provide: ItemService,
          useValue: mockItemService,
        },
        {
          provide: getQueueToken('bid-queue'),
          useValue: mockBidQueue,
        },
      ],
    }).compile();

    itemController = module.get<ItemController>(ItemController);
    bidQueue = module.get<Queue>(getQueueToken('bid-queue'));
  });

  it('should be defined', () => {
    expect(itemController).toBeDefined();
  });

  describe('mine', () => {
    it('should return items belonging to the user', async () => {
      const items: Item[] = [
        {
          id: 1,
          name: 'Item 1',
          currentPrice: 10,
          startingPrice: 10,
          timeWindowHours: 24,
          publishedAt: new Date(),
          user: mockUserRequest.user,
          bids: [],
        },
        {
          id: 2,
          name: 'Item 2',
          currentPrice: 10,
          startingPrice: 15,
          timeWindowHours: 48,
          publishedAt: new Date(),
          user: mockUserRequest.user,
          bids: [],
        },
      ];

      const paginatedItems: PaginateItems = {
        totalPages: 1,
        page: 1,
        limit: 10,
        items: items,
      };
      mockItemService.findAllByUser.mockResolvedValue(paginatedItems);

      const result = await itemController.mine(mockUserRequest);

      expect(mockItemService.findAllByUser).toHaveBeenCalled;
      expect(result).toEqual(paginatedItems);
    });
  });

  describe('bidItems', () => {
    const fakeUser1: User = {
      id: 3,
      email: 'test@test.com',
      password: 'password',
      walletBalance: 0,
      items: [],
      bids: [],
    };

    const fakeUser2: User = {
      id: 4,
      email: 'test@testo.com',
      password: 'password',
      walletBalance: 0,
      items: [],
      bids: [],
    };

    it('should return items not belonging to the user', async () => {
      const items: Item[] = [
        {
          id: 3,
          name: 'Item 3',
          currentPrice: 20,
          startingPrice: 20,
          timeWindowHours: 72,
          publishedAt: new Date(),
          user: fakeUser1,
          bids: [],
        },
        {
          id: 4,
          name: 'Item 4',
          currentPrice: 25,
          startingPrice: 25,
          timeWindowHours: 96,
          publishedAt: new Date(),
          user: fakeUser2,
          bids: [],
        },
      ];
      mockItemService.findAllPublishedItems.mockResolvedValue(items);

      const result = await itemController.bidItems(mockUserRequest);

      expect(mockItemService.findAllPublishedItems).toHaveBeenCalled;
      expect(result).toEqual(items);
    });
  });

  describe('create', () => {
    it('should create a new item', async () => {
      const itemCreateDto: ItemCreateDto = {
        name: 'Item 5',
        startingPrice: 500,
        timeWindowHours: 1,
      };
      const createdItem: Item = {
        id: 5,
        name: itemCreateDto.name,
        currentPrice: 30,
        startingPrice: 30,
        timeWindowHours: 120,
        publishedAt: new Date(),
        user: mockUserRequest.user,
        bids: [],
      };

      mockItemService.create.mockResolvedValue(createdItem);

      const result = await itemController.create(
        mockUserRequest,
        itemCreateDto,
      );

      expect(mockItemService.create).toHaveBeenCalledWith(
        mockUserRequest.user,
        itemCreateDto,
      );
      expect(result).toEqual(createdItem);
    });
  });

  describe('publish', () => {
    it('should publish an item', async () => {
      const itemId = 6;
      const itemPublishDto: ItemPublishDto = {
        publishedAt: new Date().toString(),
      };
      const publishdItem: Item = {
        id: itemId,
        name: 'random',
        currentPrice: 40,
        startingPrice: 40,
        timeWindowHours: 1,
        publishedAt: new Date(itemPublishDto.publishedAt),
        user: mockUserRequest.user,
        bids: [],
      };
      mockItemService.publish.mockResolvedValue(publishdItem);

      const result = await itemController.publish(itemId, itemPublishDto);

      expect(mockItemService.publish).toHaveBeenCalledWith(
        itemId,
        itemPublishDto,
      );
      expect(bidQueue.add).toHaveBeenCalledWith(
        'cancelFailedBids',
        {
          itemId: publishdItem.id,
        },
        { delay: publishdItem.timeWindowHours * 3600 },
      );
      expect(result).toEqual(publishdItem);
    });
  });
});
