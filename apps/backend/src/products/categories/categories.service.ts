import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  private readonly logger = new Logger(CategoriesService.name);

  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    const { name } = createCategoryDto;

    // Verificar si ya existe una categoría con el mismo nombre
    const existingCategory = await this.categoryRepository.findOneBy({ name });
    if (existingCategory) {
      throw new BadRequestException(`Category with name "${name}" already exists.`);
    }

    const newCategory = this.categoryRepository.create(createCategoryDto);
    try {
      return await this.categoryRepository.save(newCategory);
    } catch (error) {
      // Manejar errores específicos de la base de datos si es necesario
      this.logger.error(`Error creating category: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findAll(): Promise<Category[]> {
    return this.categoryRepository.find({
      // Puedes cargar la relación 'products' si la necesitas, pero ten cuidado con grandes cantidades de datos
      // relations: ['products']
    });
  }

  async findOne(id: string): Promise<Category> {
    const category = await this.categoryRepository.findOneBy({ id });
    if (!category) {
      throw new NotFoundException(`Category with ID "${id}" not found.`);
    }
    return category;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<Category> {
    const category = await this.findOne(id); // Reutiliza findOne para verificar existencia

    // Si el nombre se está actualizando, verificar si el nuevo nombre ya existe
    if (updateCategoryDto.name && updateCategoryDto.name !== category.name) {
      const existingCategory = await this.categoryRepository.findOneBy({ name: updateCategoryDto.name });
      if (existingCategory && existingCategory.id !== id) {
        throw new BadRequestException(`Category with name "${updateCategoryDto.name}" already exists.`);
      }
    }

    // Aplica las actualizaciones al objeto de la categoría
    Object.assign(category, updateCategoryDto);

    try {
      return await this.categoryRepository.save(category);
    } catch (error) {
      this.logger.error(`Error updating category ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

async remove(id: string): Promise<void> {
  const category = await this.categoryRepository.findOne({
    where: { id },
    relations: ['products'], // Asegúrate de incluir los productos
  });

  if (!category) {
    throw new NotFoundException(`Category with ID "${id}" not found.`);
  }

  if (category.products && category.products.length > 0) {
    throw new BadRequestException(`No se puede eliminar la categoría porque tiene productos asociados.`);
  }

  const result = await this.categoryRepository.delete(id);
  if (result.affected === 0) {
    throw new NotFoundException(`Category with ID "${id}" not found for deletion.`);
  }
}

}