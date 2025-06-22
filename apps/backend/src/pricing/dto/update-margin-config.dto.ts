import { PartialType } from '@nestjs/mapped-types';
import { CreateMarginConfigDto } from './create-margin-config.dto';

export class UpdateMarginConfigDto extends PartialType(CreateMarginConfigDto) {}
