import { UserRequest } from 'app.middleware';

import { Body, Controller, HttpCode, HttpStatus, Post, Req } from '@nestjs/common';
import {
    ApiBearerAuth, ApiCreatedResponse, ApiNotFoundResponse, ApiTags, ApiUnauthorizedResponse
} from '@nestjs/swagger';

import { BidService } from './bid.service';
import { BidCreateDto } from './dto/bid-create.dto';

@ApiBearerAuth()
@ApiTags('Bids')
@Controller('/api/v1/bids')
export class BidController {
  constructor(private readonly bidService: BidService) {}

  @Post()
  @ApiCreatedResponse({ description: 'Bid created successfully' })
  @ApiUnauthorizedResponse({ description: 'Incorrect username or password' })
  @ApiNotFoundResponse({ description: 'Item is not found' })
  @HttpCode(HttpStatus.CREATED)
  async create(@Req() req: UserRequest, @Body() bidCreateDto: BidCreateDto) {
    return this.bidService.create(req.user, bidCreateDto);
  }
}
