import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { Role } from './entities/role.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Role)
    private rolesRepository: Repository<Role>,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { email },
      relations: ['role'],
    });
  }

  async create(dto: CreateUserDto): Promise<User> {
    const role = await this.rolesRepository.findOneBy({ id: dto.roleId });
    if (!role) throw new NotFoundException('Rol no encontrado');

    const user = this.usersRepository.create({
      ...dto,
      role,
    });
    return this.usersRepository.save(user);
  }
}
