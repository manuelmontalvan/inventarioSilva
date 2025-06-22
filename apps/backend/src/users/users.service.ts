import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Role } from './roles/role.entity';
import * as bcrypt from 'bcrypt';

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

  async create(dto: CreateUserDto): Promise<Omit<User, 'password'>> {
    const existingUser = await this.usersRepository.findOneBy({
      email: dto.email,
    });
    if (existingUser) {
      throw new BadRequestException('Email ya en uso');
    }

    if (!dto.roleId) {
      throw new BadRequestException('El roleId es requerido');
    }

    const role = await this.rolesRepository.findOneBy({ id: dto.roleId });
    if (!role) throw new NotFoundException('Rol no encontrado');

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = this.usersRepository.create({
      email: dto.email,
      name: dto.name,
      lastname: dto.lastname,
      password: hashedPassword,
      role,
      hiredDate: dto.hiredDate,
      isActive: dto.isActive ?? true,
    });

    const savedUser = await this.usersRepository.save(user);

    const { password, ...userWithoutPassword } = savedUser;
    return userWithoutPassword;
  }

  private async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt();
    return bcrypt.hash(password, salt);
  }

 async update(id: string, dto: UpdateUserDto) {
  const user = await this.usersRepository.findOne({
    where: { id },
    relations: ['role'],
  });

  if (!user) throw new NotFoundException('Usuario no encontrado');

  // ... resto igual
}
async findAll(): Promise<User[]> {
  return this.usersRepository.find({
    relations: ['role'],
    select: {
      password: false,
    },
  });
}

async delete(id: string): Promise<void> {
  const user = await this.usersRepository.findOneBy({ id });
  if (!user) throw new NotFoundException('Usuario no encontrado');
  await this.usersRepository.remove(user);
}

async findOne(id: string): Promise<User> {
  const user = await this.usersRepository.findOne({
    where: { id },
    relations: ['role'],
  });
  if (!user) throw new NotFoundException('Usuario no encontrado');
  return user;
}

async updateRefreshToken(userId: string, token: string | null): Promise<void> {
  await this.usersRepository.update(userId, { refreshToken: token });
}

async findByIdWithRelations(id: string) {
  return this.usersRepository.findOne({
    where: { id },
    relations: ['role'],
  });
}
}