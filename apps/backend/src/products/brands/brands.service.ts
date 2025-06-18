
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Brand } from '../entities/brand.entity';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class BrandsService {
  constructor(
    @InjectRepository(Brand)
    private readonly repo: Repository<Brand>,
  ) {}

  create(dto: CreateBrandDto) {
    return this.repo.save(this.repo.create(dto));
  }

  findAll() {
    return this.repo.find();
  }

  findOne(id: string) {
    return this.repo.findOne({ where: { id } });
  }

  async update(id: string, dto: UpdateBrandDto) {
    await this.repo.update(id, dto);
    return this.findOne(id);
  }

 async remove(id: string) {
  try {
    const result = await this.repo.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Marca no encontrada');
    }
    return; // o simplemente return null;
  } catch (error) {
    if (error.code === '23503') {
      // Código de error de Postgres: restricción de clave foránea
      throw new BadRequestException('No se puede eliminar la marca porque tiene productos asociados.');
    }
    throw new BadRequestException('Error al eliminar la marca');
  }

}
}