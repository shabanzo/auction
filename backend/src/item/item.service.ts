import { Not, Repository } from 'typeorm';

import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { User } from '../user/user.entity';
import { ItemCreateDto } from './dto/item-create.dto';
import { ItemPublishDto } from './dto/item-publish.dto';
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

  async publishItem(user: User, itemPublishDto: ItemPublishDto): Promise<Item> {
    const { itemId } = itemPublishDto;

    const item = await this.itemRepository.findOneBy({ id: itemId });

    if (!item) {
      throw new NotFoundException(`Item with ID ${itemId} not found`);
    }

    if (item.user.id !== user.id) {
      throw new UnauthorizedException('You do not have permission to publish this item');
    }

    item.published = true;

    return this.itemRepository.save(item);
  }
}
