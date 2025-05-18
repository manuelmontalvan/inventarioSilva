import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './role.entity';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private rolesRepository: Repository<Role>,
  ) {}

  async createRole(name: string): Promise<Role> {
    const role = this.rolesRepository.create({ name });
    return this.rolesRepository.save(role);
  }

 async findByName(name: string): Promise<Role | undefined> {
  const role = await this.rolesRepository.findOne({ where: { name } });
  return role ?? undefined;
}


  async findById(id: number): Promise<Role> {
    const role = await this.rolesRepository.findOneBy({ id });
    if (!role) throw new NotFoundException('Rol no encontrado');
    return role;
  }

  async updateRole(id: number, name: string): Promise<Role> {
    const role = await this.findById(id);
    role.name = name;
    return this.rolesRepository.save(role);
  }

  async deleteRole(id: number): Promise<void> {
    const role = await this.findById(id);
    await this.rolesRepository.remove(role);
  }

  async findAll(): Promise<Role[]> {
    return this.rolesRepository.find();
  }
}
