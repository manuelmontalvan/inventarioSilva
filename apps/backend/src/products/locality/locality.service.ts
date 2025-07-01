import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Locality } from './entities/locality.entity';
import { CreateLocalityDto } from './dto/create-locality.dto';
import { UpdateLocalityDto } from './dto/update-locality.dto';

@Injectable()
export class LocalityService {
  constructor(
    @InjectRepository(Locality)
    private readonly localityRepository: Repository<Locality>,
  ) {}

  async create(dto: CreateLocalityDto) {
    const locality = this.localityRepository.create(dto);
    return this.localityRepository.save(locality);
  }

  findAll() {
    return this.localityRepository.find({ relations: ['shelves'] });
  }

  async findOne(id: string) {
    const locality = await this.localityRepository.findOne({
      where: { id },
      relations: ['shelves'],
    });

    if (!locality) throw new NotFoundException('Locality not found');
    return locality;
  }

  async update(id: string, dto: UpdateLocalityDto) {
    const locality = await this.localityRepository.findOneBy({ id });
    if (!locality) throw new NotFoundException('Locality not found');

    if (dto.name) locality.name = dto.name;

    return this.localityRepository.save(locality);
  }

  async remove(id: string) {
    const locality = await this.localityRepository.findOneBy({ id });
    if (!locality) throw new NotFoundException('Locality not found');
    return this.localityRepository.remove(locality);
  }

  async search(term: string) {
    return this.localityRepository
      .createQueryBuilder('locality')
      .leftJoinAndSelect('locality.shelves', 'shelf')
      .where('locality.name ILIKE :term', { term: `%${term}%` })
      .orWhere('shelf.name ILIKE :term', { term: `%${term}%` })
      .getMany();
  }
}

