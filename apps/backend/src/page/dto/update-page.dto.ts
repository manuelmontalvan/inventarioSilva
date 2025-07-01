// dto/update-page.dto.ts
import { IsOptional, IsString } from 'class-validator';

export class UpdatePageDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  path?: string;
}
