import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Brand } from '../entities/brand.entity';
import { CreateBrandDto } from '../dtos/brand/create-brand.dto';
import { UpdateBrandDto } from '../dtos/brand/update-brand.dto';

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

  remove(id: string) {
    return this.repo.delete(id);
  }
}
