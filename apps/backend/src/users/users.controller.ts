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



@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(@Body() dto: CreateUserDto) {
   
    return this.usersService.create(dto);
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.admin)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.delete(+id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.admin)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
  console.log('Actualizando usuario con PATCH:', id, updateUserDto);
  return this.usersService.update(+id, updateUserDto);
}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.admin)
  @Get()
  findAll() {
    return this.usersService.findAll();
  }
}
