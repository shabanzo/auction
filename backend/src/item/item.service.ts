import { Repository, SelectQueryBuilder } from 'typeorm';

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { User } from '../user/user.entity';
import { ItemCreateDto } from './dto/item-create.dto';
import { ItemUpdateDto } from './dto/item-update.dto';
import { Item } from './item.entity';

export interface PaginateItems {
  page: number;
  limit: number;
  totalPages: number;
  items: Item[];
}
@Injectable()
export class ItemService {
  constructor(
    @InjectRepository(Item)
    private readonly itemRepository: Repository<Item>,
  ) {}

  async findAllByUser(
    user: User,
    page: number = 1,
    limit: number = 10
  ): Promise<PaginateItems> {
    const skip = (page - 1) * limit;
    const items = await this.itemRepository.find({
      where: { user },
      skip,
      take: limit,
    });
    const totalItems = await this.countItemsByUser(user);
    const totalPages = Math.ceil(totalItems / limit);
    return {
      page: page,
      limit: limit,
      totalPages: totalPages,
      items,
    };
  }

  async countItemsByUser(user: User): Promise<number> {
    return this.itemRepository
      .createQueryBuilder('item')
      .where('item.user = :userId', { userId: user.id })
      .getCount();
  }

  async findAllPublishedItems(
    user: User,
    page: number = 1,
    limit: number = 10
  ): Promise<PaginateItems> {
    const queryBuilder: SelectQueryBuilder<Item> = this.itemRepository
      .createQueryBuilder('item')
      .where('item.user <> :userId', { userId: user.id })
      .andWhere('item.publishedAt IS NOT NULL')
      .andWhere(
        `NOW() < (item.publishedAt + INTERVAL '1 hour' * item.timeWindowHours)`
      )
      .skip((page - 1) * limit)
      .take(limit);
    const items = await queryBuilder.getMany();
    const totalItems = await this.countItemsNotBelongingToUser(user);
    const totalPages = Math.ceil(totalItems / limit);
    return {
      page: page,
      limit: limit,
      totalPages: totalPages,
      items,
    };
  }

  async countItemsNotBelongingToUser(user: User): Promise<number> {
    return this.itemRepository
      .createQueryBuilder('item')
      .where('item.user <> :userId', { userId: user.id })
      .getCount();
  }

  async create(itemDto: ItemCreateDto): Promise<Item> {
    const item = this.itemRepository.create(itemDto);
    return this.itemRepository.save(item);
  }

  async update(id: number, itemDto: ItemUpdateDto): Promise<Item> {
    const item = await this.itemRepository.preload({
      id,
      ...itemDto,
    });
    if (!item) {
      throw new NotFoundException(`Item with ID ${id} not found`);
    }
    return this.itemRepository.save(item);
  }

  async delete(id: number): Promise<void> {
    const item = await this.itemRepository.findOneBy({id});
    if (!item) {
      throw new NotFoundException(`Item with ID ${id} not found`);
    }
    await this.itemRepository.remove(item);
  }
}
