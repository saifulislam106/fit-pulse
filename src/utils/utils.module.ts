import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { MailModule } from './mail/mail.module';
import { MulterModule } from './multer/multer.module';
import { FileModule } from './file/file.module';
import { SeedModule } from './seed/seed.module';
import { UtilModule } from './util/util.module';

@Module({
  imports: [
    PrismaModule,
    MailModule,
    MulterModule,
    FileModule,
    SeedModule,
    UtilModule,
  ],
})
export class UtilsModule {}
