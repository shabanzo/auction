import { UserRequest } from 'app.middleware';

import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, Req } from '@nestjs/common';
import {
    ApiCreatedResponse, ApiNotFoundResponse, ApiOkResponse, ApiTags, ApiUnauthorizedResponse
} from '@nestjs/swagger';

import { Bid } from './bid.entity';
import { BidService } from './bid.service';
import { BidCreateDto } from './dto/bid-create.dto';

@ApiTags('Bids')
@Controller('/api/v1/bids')
export class BidController {
  constructor(private readonly bidService: BidService) {}

  @Get(':itemId')
  @ApiOkResponse({ description: 'Ok' })
  @HttpCode(HttpStatus.OK)
  async getBids(@Param('itemId') itemId: number): Promise<Bid[]> {
    return this.bidService.findAllByItem(itemId);
  }

  @Post()
  @ApiCreatedResponse({ description: 'Bid created successfully' })
  @ApiUnauthorizedResponse({ description: 'Incorrect username or password' })
  @ApiNotFoundResponse({ description: 'Item is not found' })
  @HttpCode(HttpStatus.CREATED)
  async create(@Req() req: UserRequest, @Body() bidCreateDto: BidCreateDto) {
    return this.bidService.create(req.user, bidCreateDto);
  }
}
