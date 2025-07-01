import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Role} from './entities/role.entity';
import { Page } from '../../page/entities/page.entity'; // Importar entidad Page

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private rolesRepository: Repository<Role>,

    @InjectRepository(Page)
    private pageRepository: Repository<Page>, // Inyectar repositorio de Page
  ) {}

  async createRole(name: string, pageIds: string[] = []): Promise<Role> {
    const role = this.rolesRepository.create({ name });

    if (pageIds.length > 0) {
      const pages = await this.pageRepository.findBy({ id: In(pageIds) });
      role.pages = pages;
    }

    return this.rolesRepository.save(role);
  }

  async findByName(name: string): Promise<Role | undefined> {
    const role = await this.rolesRepository.findOne({
      where: { name },
      relations: ['pages'],
    });
    return role ?? undefined;
  }

  async findById(id: string): Promise<Role> {
    const role = await this.rolesRepository.findOne({
      where: { id },
      relations: ['pages'],
    });
    if (!role) throw new NotFoundException('Rol no encontrado');
    return role;
  }

  async updateRole(
    id: string,
    name: string,
    pageIds: string[] = [],
  ): Promise<Role> {
    const role = await this.findById(id);
    role.name = name;

    if (pageIds.length > 0) {
      const pages = await this.pageRepository.findBy({ id: In(pageIds) });
      role.pages = pages;
    } else {
      role.pages = [];
    }

    return this.rolesRepository.save(role);
  }

  async deleteRole(id: string): Promise<void> {
    const role = await this.findById(id);
    await this.rolesRepository.remove(role);
  }

  async findAll(): Promise<Role[]> {
    return this.rolesRepository.find({ relations: ['pages'] });
  }
  async findAllPaginated(page: number, limit: number): Promise<{ data: Role[]; total: number }> {
  const [data, total] = await this.rolesRepository.findAndCount({
    skip: (page - 1) * limit,
    take: limit,
    relations: ['pages'],
    order: { name: 'ASC' },
  });
  return { data, total };
}

}
