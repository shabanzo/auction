import { UserRequest } from 'app.middleware';

import {
    Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put, Req
} from '@nestjs/common';

import { ItemCreateDto } from './dto/item-create.dto';
import { ItemPublishDto } from './dto/item-publish.dto';
import { ItemUpdateDto } from './dto/item-update.dto';
import { Item } from './item.entity';
import { ItemService } from './item.service';

@Controller('items')
export class ItemController {
  constructor(private readonly itemService: ItemService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async myItems(@Req() req: UserRequest): Promise<Item[]> {
    return this.itemService.findAllByUser(req.user);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async biddingItems(@Req() req: UserRequest): Promise<Item[]> {
    return this.itemService.findAllNotBelongingToUser(req.user);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() itemCreateDto: ItemCreateDto) {
    return this.itemService.create(itemCreateDto);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  async update(@Param('id') id: number, @Body() itemUpdateDto: ItemUpdateDto) {
    return this.itemService.update(id, itemUpdateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: number) {
    return this.itemService.delete(id);
  }

  @Post('publish')
  async publishItem(@Req() req: UserRequest, @Body() itemPublishDto: ItemPublishDto): Promise<any> {
    const publishedItem = await this.itemService.publishItem(req.user, itemPublishDto);
    return { message: 'Item published successfully', item: publishedItem };
  }
}
