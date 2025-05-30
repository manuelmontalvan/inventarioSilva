import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UnitOfMeasure } from '../entities/unit-of-measure.entity';
import { UnitsService } from './units.service';
import { UnitsController } from './units.controller';
import { UnitsSeed } from './unit-of-measure.seed';

@Module({
  imports: [TypeOrmModule.forFeature([UnitOfMeasure])],
  controllers: [UnitsController],
  providers: [UnitsService, UnitsSeed],
  exports: [UnitsService],
})
export class UnitsModule {}
