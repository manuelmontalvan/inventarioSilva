// src/products/dto/update-product.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateProductDto } from './create-product.dto';
import { IsString,IsOptional } from 'class-validator';
export class UpdateProductDto extends PartialType(CreateProductDto) {
  @IsString()
  @IsOptional()
  updated_by?: string;
}
