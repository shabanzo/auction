import { Not, Repository } from 'typeorm';

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { User } from '../user/user.entity';
import { ItemCreateDto } from './dto/item-create.dto';
import { ItemUpdateDto } from './dto/item-update.dto';
import { Item } from './item.entity';

@Injectable()
export class ItemService {
  constructor(
    @InjectRepository(Item)
    private readonly itemRepository: Repository<Item>,
  ) {}

  async findAllByUser(user: User): Promise<Item[]> {
    return await user.items;
  }

  async findAllNotBelongingToUser(user: User): Promise<Item[]> {
    return await this.itemRepository.find({
      where: {
        user: Not(user),
      },
    });
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
