import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Locality } from './locality.entity';
import { Category } from '../entities/category.entity';
import { CreateLocalityDto } from './dto/create-locality.dto';
import { UpdateLocalityDto } from './dto/update-locality.dto';

@Injectable()
export class LocalityService {
  constructor(
    @InjectRepository(Locality)
    private localityRepository: Repository<Locality>,

    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  async create(dto: CreateLocalityDto) {
    const category = await this.categoryRepository.findOneBy({ id: dto.categoryId });
    if (!category) throw new NotFoundException('Category not found');

    const locality = this.localityRepository.create({
      name: dto.name,
      category,
    });

    return this.localityRepository.save(locality);
  }

  findAll() {
    return this.localityRepository.find({ relations: ['category'] });
  }

  async findOne(id: string) {
    const locality = await this.localityRepository.findOne({
      where: { id },
      relations: ['category'],
    });

    if (!locality) throw new NotFoundException('Locality not found');
    return locality;
  }

  async update(id: string, dto: UpdateLocalityDto) {
    const locality = await this.localityRepository.findOneBy({ id });
    if (!locality) throw new NotFoundException('Locality not found');

    if (dto.categoryId) {
      const category = await this.categoryRepository.findOneBy({ id: dto.categoryId });
      if (!category) throw new NotFoundException('Category not found');
      locality.category = category;
    }

    if (dto.name) locality.name = dto.name;

    return this.localityRepository.save(locality);
  }

  async remove(id: string) {
    const locality = await this.localityRepository.findOneBy({ id });
    if (!locality) throw new NotFoundException('Locality not found');
    return this.localityRepository.remove(locality);
  }
}
