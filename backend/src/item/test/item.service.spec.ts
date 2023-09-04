import { Repository } from 'typeorm';

import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { Item } from '../item.entity';
import { ItemService } from '../item.service';

const mockRepository = {
  find: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  preload: jest.fn(),
  findOneBy: jest.fn(),
  remove: jest.fn(),
  merge: jest.fn(),
};

describe('ItemService', () => {
  let itemService: ItemService;
  let itemRepository: Repository<Item>;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ItemService,
        {
          provide: getRepositoryToken(Item),
          useValue: mockRepository,
        },
      ],
    }).compile();

    itemService = module.get<ItemService>(ItemService);
    itemRepository = module.get<Repository<Item>>(getRepositoryToken(Item));

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(itemService).toBeDefined();
  });

  describe('findAllByUser', () => {
    it('should return items belonging to the user with pagination', async () => {
      const user = { items: [{ name: 'Item 1' }, { name: 'Item 2' }] };

      const mockPaginatedResponse = {
        page: 1,
        limit: 10,
        totalPages: 1,
        items: user.items,
      };

      jest
        .spyOn(itemService, 'findAllByUser')
        .mockResolvedValue(mockPaginatedResponse as any);

      const result = await itemService.findAllByUser(user as any, 1, 10);

      expect(result).toEqual(mockPaginatedResponse);
    });
  });

  describe('findAllPublishedItems', () => {
    it('should return items not belonging to the user with pagination', async () => {
      const user = { id: 1 };

      const mockPaginatedResponse = {
        page: 1,
        limit: 10,
        totalPages: 1,
        items: [{ name: 'Item 1' }, { name: 'Item 2' }],
      };

      jest
        .spyOn(itemService, 'findAllPublishedItems')
        .mockResolvedValue(mockPaginatedResponse as any);

      const result = await itemService.findAllPublishedItems(
        user as any,
        1,
        10,
      );

      expect(result).toEqual(mockPaginatedResponse);
    });
  });

  describe('create', () => {
    const user = {
      id: 1,
      email: 'test@example.com',
      password: 'hashed-password',
      walletBalance: 100,
      items: [],
      bids: [],
    };
    it('should create and return an item', async () => {
      const itemDto = {
        name: 'Item 1',
        startingPrice: 10,
        timeWindowHours: 24,
      };

      const itemAttr = {
        ...itemDto,
        user: user,
        currentPrice: 10,
      };
      const createdItem = { ...itemDto, id: 1 };
      mockRepository.create.mockReturnValue(itemDto);
      mockRepository.save.mockReturnValue(createdItem);
      const result = await itemService.create(user, itemDto);
      expect(mockRepository.create).toHaveBeenCalledWith(itemAttr);
      expect(result).toEqual(createdItem);
    });
  });

  describe('publish', () => {
    const id = 1;
    const itemDto = {
      publishedAt: new Date().toString(),
    };
    it('should publish and return an item', async () => {
      const publishdItem = { id, ...itemDto };

      mockRepository.findOneBy.mockResolvedValue(publishdItem);
      mockRepository.save.mockResolvedValue(publishdItem);
      const result = await itemService.publish(id, itemDto);
      expect(mockRepository.findOneBy).toHaveBeenCalledWith({ id });
      expect(mockRepository.save).toHaveBeenCalledWith(publishdItem);
      expect(result).toEqual(publishdItem);
    });

    it('should throw NotFoundException if item is not found', async () => {
      mockRepository.findOneBy.mockResolvedValue(undefined);
      await expect(itemService.publish(id, itemDto)).rejects.toThrowError(
        NotFoundException,
      );
      expect(mockRepository.merge).not.toHaveBeenCalled();
      expect(mockRepository.save).not.toHaveBeenCalled();
    });
  });
});
