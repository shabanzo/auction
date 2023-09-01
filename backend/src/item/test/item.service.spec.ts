import { ItemPublishDto } from 'item/dto/item-publish.dto';
import { Repository } from 'typeorm';

import { NotFoundException, UnauthorizedException } from '@nestjs/common';
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
    it('should return items belonging to the user', async () => {
      const user = { items: [{ name: 'Item 1' }, { name: 'Item 2' }] };
      const result = await itemService.findAllByUser(user as any);
      expect(result).toEqual(user.items);
    });
  });

  describe('findAllNotBelongingToUser', () => {
    it('should return items not belonging to the user', async () => {
      const user = { id: 1 };
      const items = [{ name: 'Item 1' }, { name: 'Item 2' }];
      mockRepository.find.mockReturnValue(items);
      const result = await itemService.findAllNotBelongingToUser(user as any);
      expect(result).toEqual(items);
      expect(mockRepository.find).toHaveBeenCalledWith({
        where: {
          user: expect.any(Object),
        },
      });
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

  describe('publishItem', () => {
    it('should publish an item if it belongs to the user', async () => {
      const user = { id: 1 };
      const itemId = 1;
      const item = { id: itemId, user: { id: 1 } } as Item;
      const itemPublishDto: ItemPublishDto = { itemId };

      mockRepository.findOneBy.mockResolvedValue(item);

      await itemService.publishItem(user as any, itemPublishDto);

      expect(mockRepository.findOneBy).toHaveBeenCalledWith({ id: itemId });
      expect(mockRepository.save).toHaveBeenCalledWith(item);
    });

    it('should throw NotFoundException if the item does not exist', async () => {
      const user = { id: 1 };
      const itemId = 1;
      const itemPublishDto: ItemPublishDto = { itemId };

      mockRepository.findOneBy.mockResolvedValue(undefined);

      await expect(itemService.publishItem(user as any, itemPublishDto)).rejects.toThrowError(NotFoundException);
    });

    it('should throw UnauthorizedException if the item does not belong to the user', async () => {
      const user = { id: 1 };
      const itemId = 1;
      const item = { id: itemId, user: { id: 2 } } as Item;
      const itemPublishDto: ItemPublishDto = { itemId };

      mockRepository.findOneBy.mockResolvedValue(item);

      await expect(itemService.publishItem(user as any, itemPublishDto)).rejects.toThrowError(UnauthorizedException);
    });
  });
});
