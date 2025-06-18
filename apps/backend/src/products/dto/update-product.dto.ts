import { PartialType } from '@nestjs/mapped-types'; // O si usas @nestjs/swagger, usa PartialType de ahí
import { CreateProductDto } from './create-product.dto';

export class UpdateProductDto extends PartialType(CreateProductDto) {}