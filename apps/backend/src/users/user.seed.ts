// src/users/seeds/user.seed.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { UsersService } from './users.service';
import { RolesService } from './roles/roles.service';

@Injectable()
export class UserSeed implements OnModuleInit {
  constructor(
    private readonly usersService: UsersService,
    private readonly rolesService: RolesService,
  ) {}

  async onModuleInit() {
    const email = 'admin@FerreteriaSilva.com';

    // Evitar duplicado si ya existe
    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) {
      console.log('ℹ️ Usuario admin ya existe.');
      return;
    }

    // Buscar el rol "admin" por nombre
    const role = await this.rolesService.findByName('admin');
    if (!role) {
      console.warn('⚠️ Rol admin no encontrado. Asegúrate de ejecutar el seed de roles primero.');
      return;
    }

    // Crear el usuario con el roleId obtenido
    await this.usersService.create({
      email,
      password: '123456',
      name: 'Super',
      lastname: 'Admin',
      roleId: role.id,
      hiredDate: new Date().toISOString(),
      isActive: true,
    });

    console.log('✅ Usuario admin sembrado con éxito.');
  }
}
