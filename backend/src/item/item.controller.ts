import { UserRequest } from 'app.middleware';
import { Queue } from 'bull';

import { InjectQueue } from '@nestjs/bull';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseBoolPipe,
  Post,
  Put,
  Query,
  Req,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';

import { ItemCreateDto } from './dto/item-create.dto';
import { ItemUpdateDto } from './dto/item-update.dto';
import { ItemService, PaginateItems } from './item.service';

@ApiBearerAuth()
@ApiTags('Items')
@Controller('/api/v1/items')
export class ItemController {
  constructor(
    private readonly itemService: ItemService,
    @InjectQueue('bidQueue')
    private readonly bidQueue: Queue,
  ) {}

  @Get('mine')
  @ApiOkResponse({ description: 'Ok' })
  @HttpCode(HttpStatus.OK)
  async mine(
    @Req() req: UserRequest,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ): Promise<PaginateItems> {
    return this.itemService.findAllByUser(req.user, page, limit);
  }

  @Get('auction')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ description: 'Ok' })
  async bidItems(
    @Req() req: UserRequest,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('completed', new ParseBoolPipe()) completed: boolean = false,
  ): Promise<PaginateItems> {
    return this.itemService.findAllPublishedItems(
      req.user,
      page,
      limit,
      completed,
    );
  }

  @Post()
  @ApiCreatedResponse({ description: 'Item created successfully' })
  @HttpCode(HttpStatus.CREATED)
  async create(@Req() req: UserRequest, @Body() itemCreateDto: ItemCreateDto) {
    const createdItem = await this.itemService.create(req.user, itemCreateDto);
    await this.bidQueue.add('cancelFailedBids', { itemId: createdItem.id });
    return createdItem;
  }

  @Put(':id')
  @ApiOkResponse({ description: 'Item updated successfully' })
  @ApiNotFoundResponse({ description: 'Item is not found' })
  @HttpCode(HttpStatus.OK)
  async update(@Param('id') id: number, @Body() itemUpdateDto: ItemUpdateDto) {
    return this.itemService.update(id, itemUpdateDto);
  }
}
