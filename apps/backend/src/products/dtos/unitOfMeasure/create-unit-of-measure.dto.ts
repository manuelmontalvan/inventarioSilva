import { IsString, IsNotEmpty } from 'class-validator';

export class CreateUnitOfMeasureDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  abbreviation: string;
}
