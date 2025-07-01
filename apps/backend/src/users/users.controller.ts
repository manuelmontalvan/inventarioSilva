import { Patch, Controller, Post, Body, Get } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { UseGuards } from '@nestjs/common';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorator/roles.decorator';
import { RoleType } from '../common/enum/roles.enum';
import { Delete, Param, Put } from '@nestjs/common';
import { Request } from 'express';
import { ConflictException, Req } from '@nestjs/common';



@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }
async validate(payload: any) {
  return { id: payload.sub, email: payload.email, role: payload.role };
}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.admin)
 @Delete(':id')
async remove(@Param('id') id: string, @Req() req: Request) {
  const userId = req.user?.id; // <- del token JWT o sesión

  if (id === userId) {
    throw new ConflictException('No puedes eliminar tu propia cuenta');
  }

  return this.usersService.delete(id);

}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.admin)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    console.log('Actualizando usuario con PATCH:', id, updateUserDto);
    // Pasa id como string
    return this.usersService.update(id, updateUserDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.admin)
  @Get()
  findAll() {
    return this.usersService.findAll();
  }
}
