import { Module } from '@nestjs/common';
import { UtilService } from './util.service';

@Module({
  controllers: [],
  providers: [UtilService],
})
export class UtilModule {}
