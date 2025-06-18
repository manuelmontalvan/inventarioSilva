import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards, // Import UseGuards
  HttpCode,  // Import HttpCode
  HttpStatus // Import HttpStatus
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
// Corrected DTO import paths
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

// Import security components
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorator/roles.decorator';
import { RoleType } from '../../common/enum/roles.enum';

@Controller('categories')
// Apply guards globally to this controller for authentication and role checks
@UseGuards(JwtAuthGuard, RolesGuard)
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  // Only admins and inventory managers can create categories
  @Roles(RoleType.admin, RoleType.bodeguero)
  @HttpCode(HttpStatus.CREATED) // Return 201 Created for successful POST
  create(@Body() dto: CreateCategoryDto) {
    return this.categoriesService.create(dto);
  }

  @Get()
  // Admins, inventory managers, and salespeople can view categories
  @Roles(RoleType.admin, RoleType.bodeguero, RoleType.vendedor)
  findAll() {
    return this.categoriesService.findAll();
  }

  @Get(':id')
  // Admins, inventory managers, and salespeople can view a single category
  @Roles(RoleType.admin, RoleType.bodeguero, RoleType.vendedor)
  findOne(@Param('id') id: string) {
    return this.categoriesService.findOne(id);
  }

  @Put(':id') // Using @Put for full resource replacement updates
  // Only admins and inventory managers can update categories
  @Roles(RoleType.admin, RoleType.bodeguero)
  update(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    return this.categoriesService.update(id, dto);
  }

  @Delete(':id')
  // Only admins can delete categories
  @Roles(RoleType.admin)
  @HttpCode(HttpStatus.NO_CONTENT) // Return 204 No Content for successful deletion
  remove(@Param('id') id: string) {
    return this.categoriesService.remove(id);
  }
}