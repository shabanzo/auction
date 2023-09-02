import { UserRequest } from 'app.middleware';

import {
    Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put, Query, Req
} from '@nestjs/common';
import {
    ApiBearerAuth, ApiCreatedResponse, ApiNoContentResponse, ApiNotFoundResponse, ApiOkResponse,
    ApiTags
} from '@nestjs/swagger';

import { ItemCreateDto } from './dto/item-create.dto';
import { ItemUpdateDto } from './dto/item-update.dto';
import { ItemService, PaginateItems } from './item.service';

@ApiBearerAuth()
@ApiTags('Items')
@Controller('/api/v1/items')
export class ItemController {
  constructor(private readonly itemService: ItemService) {}

  @Get('mine')
  @ApiOkResponse({ description: 'Ok' })
  @HttpCode(HttpStatus.OK)
  async myItems(
    @Req() req: UserRequest,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ): Promise<PaginateItems> {
    return this.itemService.findAllByUser(req.user, page, limit);
  }

  @Get('auction')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ description: 'Ok' })
  async biddingItems(
    @Req() req: UserRequest,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ): Promise<PaginateItems> {
    return this.itemService.findAllPublishedItems(req.user, page, limit);
  }

  @Post()
  @ApiCreatedResponse({ description: 'Item created successfully' })
  @HttpCode(HttpStatus.CREATED)
  async create(@Req() req: UserRequest, @Body() itemCreateDto: ItemCreateDto) {
    return this.itemService.create(req.user, itemCreateDto);
  }

  @Put(':id')
  @ApiOkResponse({ description: 'Item updated successfully' })
  @ApiNotFoundResponse({ description: 'Item is not found' })
  @HttpCode(HttpStatus.OK)
  async update(@Param('id') id: number, @Body() itemUpdateDto: ItemUpdateDto) {
    return this.itemService.update(id, itemUpdateDto);
  }

  @Delete(':id')
  @ApiNoContentResponse({ description: 'Item deleted successfully' })
  @ApiNotFoundResponse({ description: 'Item is not found' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: number) {
    return this.itemService.delete(id);
  }
}