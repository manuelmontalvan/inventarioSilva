import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UnitOfMeasure } from '../entities/unit-of-measure.entity';
import { UnitsService } from './units.service';
import { UnitsController } from './units.controller';

@Module({
  imports: [TypeOrmModule.forFeature([UnitOfMeasure])],
  controllers: [UnitsController],
  providers: [UnitsService],
})
export class UnitsModule {}
