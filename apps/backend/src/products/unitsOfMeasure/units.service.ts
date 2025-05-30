import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UnitOfMeasure } from '../entities/unit-of-measure.entity';
import { CreateUnitOfMeasureDto } from '../dtos/unitOfMeasure/create-unit-of-measure.dto';
import { UpdateUnitOfMeasureDto } from '../dtos/unitOfMeasure/update-unit-of-measure.dto';
@Injectable()
export class UnitsService {
  constructor(
    @InjectRepository(UnitOfMeasure)
    private readonly repo: Repository<UnitOfMeasure>,
  ) {}

  create(dto: CreateUnitOfMeasureDto) {
    return this.repo.save(this.repo.create(dto));
  }

  findAll() {
    return this.repo.find();
  }

  findOne(id: string) {
    return this.repo.findOne({ where: { id } });
  }
  async findByName(name: string): Promise<UnitOfMeasure | null> {
  return this.repo.findOne({ where: { name } });
}


  async update(id: string, dto: UpdateUnitOfMeasureDto) {
    await this.repo.update(id, dto);
    return this.findOne(id);
  }

  remove(id: string) {
    return this.repo.delete(id);
  }
}
