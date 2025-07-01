import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Page } from './entities/page.entity';
import { CreatePageDto } from './dto/create-page.dto';
import { UpdatePageDto } from './dto/update-page.dto';

@Injectable()
export class PagesService {
  constructor(
    @InjectRepository(Page)
    private readonly pageRepo: Repository<Page>,
  ) {}

  async create(dto: CreatePageDto): Promise<Page> {
    const page = this.pageRepo.create(dto);
    return this.pageRepo.save(page);
  }

  async findAll(): Promise<Page[]> {
    return this.pageRepo.find();
  }

  async findOne(id: string): Promise<Page> {
    const page = await this.pageRepo.findOneBy({ id });
    if (!page) throw new NotFoundException('Página no encontrada');
    return page;
  }

  async delete(id: string): Promise<void> {
    try {
      const result = await this.pageRepo.delete(id);
      if (!result.affected) {
        throw new NotFoundException('Página no encontrada');
      }
    } catch (error: any) {
      if (error.code === '23503') {
        // Clave foránea: error al eliminar porque hay referencias en otra tabla
        throw new BadRequestException(
          'No se puede eliminar esta página porque está asignada a uno o más roles.'
        );
      }
      throw error; // Para otros errores no esperados
    }
  }
async update(id: string, dto: UpdatePageDto): Promise<Page> {
  const page = await this.pageRepo.findOneBy({ id });
  if (!page) {
    throw new NotFoundException('Página no encontrada');
  }

  if (dto.name !== undefined) {
    page.name = dto.name;
  }

  if (dto.path !== undefined) {
    page.path = dto.path;
  }

  return this.pageRepo.save(page);
}

}
