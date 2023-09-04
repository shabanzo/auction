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
import { ItemPublishDto } from './dto/item-publish.dto';
import { ItemService, PaginateItems } from './item.service';

@ApiBearerAuth()
@ApiTags('Items')
@Controller('/api/v1/items')
export class ItemController {
  constructor(
    private readonly itemService: ItemService,
    @InjectQueue('bid-queue')
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
    return await this.itemService.create(req.user, itemCreateDto);
  }

  @Post(':id/publish')
  @ApiOkResponse({ description: 'Item published successfully' })
  @ApiNotFoundResponse({ description: 'Item is not found' })
  @HttpCode(HttpStatus.OK)
  async publish(
    @Param('id') id: number,
    @Body() itemPublishDto: ItemPublishDto,
  ) {
    const publishedItem = await this.itemService.publish(id, itemPublishDto);
    await this.bidQueue.add(
      'cancelFailedBids',
      { itemId: publishedItem.id },
      { delay: publishedItem.timeWindowHours * 3600 },
    );
    return publishedItem;
  }
}
