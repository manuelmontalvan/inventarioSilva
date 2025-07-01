import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Shelf } from './entities/shelf.entity';
import { Locality } from '../entities/locality.entity';
import { Category } from '../../entities/category.entity';
import { CreateShelfDto } from './dto/create-shelf.dto';
import { UpdateShelfDto } from './dto/update-shelf.dto';

@Injectable()
export class ShelfService {
  constructor(
    @InjectRepository(Shelf)
    private shelfRepository: Repository<Shelf>,

    @InjectRepository(Locality)
    private localityRepository: Repository<Locality>,

    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  async create(dto: CreateShelfDto) {
    const locality = await this.localityRepository.findOneBy({
      id: dto.localityId,
    });
    if (!locality) throw new NotFoundException('Locality not found');

    const category = await this.categoryRepository.findOneBy({
      id: dto.categoryId,
    });
    if (!category) throw new NotFoundException('Category not found');

    const shelf = this.shelfRepository.create({
      name: dto.name,
      locality,
      localityId: locality.id,
      category,
      categoryId: category.id,
    });

    return this.shelfRepository.save(shelf);
  }

  async findAll(search?: string) {
    const qb = this.shelfRepository
      .createQueryBuilder('shelf')
      .leftJoinAndSelect('shelf.locality', 'locality')
      .leftJoinAndSelect('shelf.category', 'category');

    if (search) {
      qb.where('LOWER(shelf.name) LIKE :search', {
        search: `%${search.toLowerCase()}%`,
      });
    }

    return qb.getMany();
  }

  async findOne(id: string) {
    const shelf = await this.shelfRepository.findOne({
      where: { id },
      relations: ['locality', 'category'],
    });
    if (!shelf) throw new NotFoundException('Shelf not found');
    return shelf;
  }
  async update(id: string, dto: UpdateShelfDto) {
    const shelf = await this.shelfRepository.findOneBy({ id });
    if (!shelf) throw new NotFoundException('Shelf not found');

    if (dto.name) shelf.name = dto.name;

    if (dto.localityId) {
      const locality = await this.localityRepository.findOneBy({
        id: dto.localityId,
      });
      if (!locality) throw new NotFoundException('Locality not found');
      shelf.locality = locality;
      shelf.localityId = locality.id;
    }

    if (dto.categoryId) {
      const category = await this.categoryRepository.findOneBy({
        id: dto.categoryId,
      });
      if (!category) throw new NotFoundException('Category not found');
      shelf.category = category;
      shelf.categoryId = category.id;
    }

    return this.shelfRepository.save(shelf);
  }

  async remove(id: string) {
    const shelf = await this.shelfRepository.findOneBy({ id });
    if (!shelf) throw new NotFoundException('Shelf not found');
    return this.shelfRepository.remove(shelf);
  }

  async findByLocality(localityId: string) {
    return this.shelfRepository.find({
      where: { locality: { id: localityId } },
      relations: ['locality', 'category'],
    });
  }
  async findByCategory(categoryId: string) {
    return this.shelfRepository.find({
      where: { category: { id: categoryId } },
      relations: ['locality', 'category'],
    });
  }
}
