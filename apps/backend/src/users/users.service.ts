import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Role } from './roles/role.entity';
import * as bcrypt from 'bcrypt';
import { BadRequestException } from '@nestjs/common/exceptions/bad-request.exception';

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
      throw new BadRequestException('email ya en uso');
    }

    if (!dto.roleId) {
      throw new BadRequestException('El roleId es requerido');
    }

    const role = await this.rolesRepository.findOneBy({ id: dto.roleId });
    if (!role) throw new NotFoundException('Rol no encontrado');

    // Hashear la contraseña antes de guardar
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

    // Excluir la contraseña de la respuesta
    const { password, ...userWithoutPassword } = savedUser;
    return userWithoutPassword;
  }
  private async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt();
    return bcrypt.hash(password, salt);
  }

  async update(id: number, dto: UpdateUserDto) {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: ['role'],
    });

    if (!user) throw new NotFoundException('Usuario no encontrado');

    if (dto.name) user.name = dto.name;
    if (dto.lastname) user.lastname = dto.lastname;
    if (dto.email) user.email = dto.email;
    if (dto.password) user.password = await this.hashPassword(dto.password);
    if (dto.hiredDate) user.hiredDate = new Date(dto.hiredDate);
    if (dto.isActive !== undefined) user.isActive = dto.isActive;
    if (dto.lastLogin) user.lastLogin = new Date(dto.lastLogin);
    if (dto.roleId) {
      const role = await this.rolesRepository.findOneBy({ id: dto.roleId });
      if (role) user.role = role;
    }

    return this.usersRepository.save(user);
  }

  async delete(id: number): Promise<void> {
    const user = await this.usersRepository.findOneBy({ id });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    await this.usersRepository.remove(user);
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find({
      relations: ['role'],
      select: {
        password: false, // Evita retornar la contraseña
      },
    });
  }

  async findOne(id: number): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: ['role'],
    });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    return user;
  }
  async updateRefreshToken(userId: number, token: string): Promise<void> {
    await this.usersRepository.update(userId, { refreshToken: token });
  }
  async findByIdWithRelations(id: number) {
    return this.usersRepository.findOne({
      where: { id },
      relations: ['role'], // Asegúrate de tener la relación de rol en tu entidad
    });
  }
  async findByIdWithRole(id: number) {
    return this.usersRepository.findOne({
      where: { id },
      relations: ['role'], // Asegúrate de tener la relación de rol en tu entidad
    });
  }
}
