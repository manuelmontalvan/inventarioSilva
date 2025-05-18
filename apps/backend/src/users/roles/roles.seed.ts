import { Injectable, OnModuleInit } from '@nestjs/common';
import { RolesService } from './roles.service';

@Injectable()
export class RolesSeed implements OnModuleInit {
  constructor(private readonly rolesService: RolesService) {}

  async onModuleInit() {
    const defaultRoles = ['admin', 'vendedor', 'bodeguero'];

    for (const roleName of defaultRoles) {
      const existingRole = await this.rolesService.findByName(roleName);
      if (!existingRole) {
        await this.rolesService.createRole(roleName);
        console.log(`Rol creado: ${roleName}`);
      }
    }
  }
}
