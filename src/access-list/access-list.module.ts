import { Module } from '@nestjs/common';
import { AccessListController } from './access-list.controller';
import { AccessListService } from './access-list.service';

@Module({
  controllers: [AccessListController],
  providers: [AccessListService],
  exports: [AccessListService],
})
export class AccessListModule {}
