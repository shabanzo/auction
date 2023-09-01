import { UserRequest } from 'app.middleware';

import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, Req } from '@nestjs/common';

import { Bid } from './bid.entity';
import { BidService } from './bid.service';
import { BidCreateDto } from './dto/bid-create.dto';

@Controller('bids')
export class BidController {
  constructor(private readonly bidService: BidService) {}

  @Get(':itemId')
  @HttpCode(HttpStatus.OK)
  async getBids(@Param('itemId') itemId: number): Promise<Bid[]> {
    return this.bidService.findAllByItem(itemId);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Req() req: UserRequest, @Body() bidCreateDto: BidCreateDto) {
    return this.bidService.create(req.user, bidCreateDto);
  }
}
