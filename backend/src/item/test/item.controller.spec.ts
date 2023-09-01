import { UserRequest } from 'app.middleware';
import { User } from 'user/user.entity';

import { Test, TestingModule } from '@nestjs/testing';

import { ItemCreateDto } from '../dto/item-create.dto';
import { ItemUpdateDto } from '../dto/item-update.dto';
import { ItemController } from '../item.controller';
import { Item } from '../item.entity';
import { ItemService } from '../item.service';

const mockUserRequest: UserRequest = {
  user: { id: 1 },
} as UserRequest;

const mockItemService = {
  findAllByUser: jest.fn(),
  findAllNotBelongingToUser: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

describe('ItemController', () => {
  let itemController: ItemController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ItemController],
      providers: [
        {
          provide: ItemService,
          useValue: mockItemService,
        },
      ],
    }).compile();

    itemController = module.get<ItemController>(ItemController);
  });

  it('should be defined', () => {
    expect(itemController).toBeDefined();
  });

  describe('myItems', () => {
    it('should return items belonging to the user', async () => {
      const items: Item[] = [
        { id: 1, name: 'Item 1', startingPrice: 10, timeWindowHours: 24, published: true, user: mockUserRequest.user, bids: [] },
        { id: 2, name: 'Item 2', startingPrice: 15, timeWindowHours: 48, published: true, user: mockUserRequest.user, bids: [] },
      ];
      mockItemService.findAllByUser.mockResolvedValue(items);

      const result = await itemController.myItems(mockUserRequest);

      expect(mockItemService.findAllByUser).toHaveBeenCalledWith(mockUserRequest.user);
      expect(result).toEqual(items);
    });
  });

  describe('biddingItems', () => {
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
        { id: 3, name: 'Item 3', startingPrice: 20, timeWindowHours: 72, published: true, user: fakeUser1, bids: [] },
        { id: 4, name: 'Item 4', startingPrice: 25, timeWindowHours: 96, published: true, user: fakeUser2, bids: [] },
      ];
      mockItemService.findAllNotBelongingToUser.mockResolvedValue(items);

      const result = await itemController.biddingItems(mockUserRequest);

      expect(mockItemService.findAllNotBelongingToUser).toHaveBeenCalledWith(mockUserRequest.user);
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
        startingPrice: 30,
        timeWindowHours: 120,
        published: true,
        user: mockUserRequest.user,
        bids: [],
      };
      mockItemService.create.mockResolvedValue(createdItem);

      const result = await itemController.create(itemCreateDto);

      expect(mockItemService.create).toHaveBeenCalledWith(itemCreateDto);
      expect(result).toEqual(createdItem);
    });
  });

  describe('update', () => {
    it('should update an item', async () => {
      const itemId = 6;
      const itemUpdateDto: ItemUpdateDto = { name: 'Updated Item' };
      const updatedItem: Item = {
        id: itemId,
        name: itemUpdateDto.name,
        startingPrice: 40,
        timeWindowHours: 144,
        published: true,
        user: mockUserRequest.user,
        bids: [],
      };
      mockItemService.update.mockResolvedValue(updatedItem);

      const result = await itemController.update(itemId, itemUpdateDto);

      expect(mockItemService.update).toHaveBeenCalledWith(itemId, itemUpdateDto);
      expect(result).toEqual(updatedItem);
    });
  });

  describe('delete', () => {
    it('should delete an item', async () => {
      const itemId = 7;
      mockItemService.delete.mockResolvedValue(undefined);

      const result = await itemController.delete(itemId);

      expect(mockItemService.delete).toHaveBeenCalledWith(itemId);
      expect(result).toBeUndefined();
    });
  });
});
