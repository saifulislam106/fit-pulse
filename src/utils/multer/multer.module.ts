import { Module } from '@nestjs/common';
import { MulterService } from './multer.service';

@Module({
  controllers: [],
  providers: [MulterService],
})
export class MulterModule {}
