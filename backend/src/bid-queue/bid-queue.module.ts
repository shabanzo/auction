import { BullModule } from '@nestjs/bull';
// queue.module.ts
import { Module } from '@nestjs/common';

import { BidCompletedProcessor } from './bid-completed.processor';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'bidQueue',
    }),
  ],
  providers: [BidCompletedProcessor],
})
export class BidQueueModule {}
