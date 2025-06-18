import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UnitOfMeasure } from '../entities/unit-of-measure.entity';
import { CreateUnitOfMeasureDto } from './dto/create-unit-of-measure.dto';
import { UpdateUnitOfMeasureDto } from './dto/update-unit-of-measure.dto';

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

  async remove(id: string): Promise<void> {
    const unit = await this.repo.findOne({
      where: { id },
      relations: ['products'],
    });

    if (!unit) {
      throw new NotFoundException(`Unidad con ID "${id}" no encontrada.`);
    }

    if (unit.products && unit.products.length > 0) {
      throw new BadRequestException(`No se puede eliminar la unidad porque tiene productos asociados.`);
    }

    const result = await this.repo.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`Unidad con ID "${id}" no encontrada para eliminación.`);
    }
  }
}
