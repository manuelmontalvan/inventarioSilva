import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PagesService } from './page.service';
import { PagesController } from './page.controller';
import { Page } from './entities/page.entity';
import { PageSeed } from './page.seed';

@Module({
  imports: [TypeOrmModule.forFeature([Page])],
  providers: [PagesService, PageSeed],
  controllers: [PagesController],
  exports: [PagesService],
})
export class PagesModule {}