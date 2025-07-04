import { CreatePredictionDto } from './create-prediction.dto';

export class PredictionResponseDto extends CreatePredictionDto {
  id: string;
  createdAt: Date;
}
