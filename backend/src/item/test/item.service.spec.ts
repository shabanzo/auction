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

      jest.spyOn(itemService, 'findAllByUser').mockResolvedValue(mockPaginatedResponse as any);

      const result = await itemService.findAllByUser(user as any, 1, 10);

      expect(result).toEqual(mockPaginatedResponse);
    });
  });

  describe('findAllNotBelongingToUser', () => {
    it('should return items not belonging to the user with pagination', async () => {
      const user = { id: 1 };

      const mockPaginatedResponse = {
        page: 1,
        limit: 10,
        totalPages: 1,
        items: [{ name: 'Item 1' }, { name: 'Item 2' }],
      };

      jest.spyOn(itemService, 'findAllNotBelongingToUser').mockResolvedValue(mockPaginatedResponse as any);

      const result = await itemService.findAllNotBelongingToUser(user as any, 1, 10);

      expect(result).toEqual(mockPaginatedResponse);
    });
  });

  describe('create', () => {
    it('should create and return an item', async () => {
      const itemDto = { name: 'Item 1', startingPrice: 10, timeWindowHours: 24 };
      const createdItem = { ...itemDto, id: 1 };
      mockRepository.create.mockReturnValue(itemDto);
      mockRepository.save.mockReturnValue(createdItem);
      const result = await itemService.create(itemDto);
      expect(mockRepository.create).toHaveBeenCalledWith(itemDto);
      expect(mockRepository.save).toHaveBeenCalledWith(itemDto);
      expect(result).toEqual(createdItem);
    });
  });

  describe('update', () => {
    it('should update and return an item', async () => {
      const id = 1;
      const itemDto = { name: 'Updated Item', startingPrice: 20, timeWindowHours: 48 };
      const updatedItem = { id, ...itemDto };

      mockRepository.preload.mockResolvedValue(updatedItem);
      mockRepository.save.mockResolvedValue(updatedItem);
      const result = await itemService.update(id, itemDto);
      expect(mockRepository.preload).toHaveBeenCalledWith({ id, ...itemDto });
      expect(mockRepository.save).toHaveBeenCalledWith(updatedItem);
      expect(result).toEqual(updatedItem);
    });

    it('should throw NotFoundException if item is not found', async () => {
      const id = 1;
      const itemDto = { name: 'Updated Item', startingPrice: 20, timeWindowHours: 48 };

      mockRepository.preload.mockResolvedValue(undefined);
      await expect(itemService.update(id, itemDto)).rejects.toThrowError(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should delete an item', async () => {
      const id = 1;
      const item = { id, name: 'Item 1' };
      mockRepository.findOneBy.mockResolvedValue(item);
      await itemService.delete(id);
      expect(mockRepository.findOneBy).toHaveBeenCalledWith({ id });
      expect(mockRepository.remove).toHaveBeenCalledWith(item);
    });

    it('should throw NotFoundException if item is not found', async () => {
      const id = 1;
      mockRepository.findOneBy.mockResolvedValue(undefined);
      await expect(itemService.delete(id)).rejects.toThrowError(NotFoundException);
    });
  });
});
