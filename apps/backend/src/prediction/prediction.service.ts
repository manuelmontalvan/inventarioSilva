import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Prediction } from './entities/prediction.entity';
import { CreatePredictionDto } from './dto/create-prediction.dto';

@Injectable()
export class PredictionService {
  constructor(
    @InjectRepository(Prediction)
    private predictionRepository: Repository<Prediction>,
  ) {}

  async create(dto: CreatePredictionDto): Promise<Prediction> {
    const prediction = this.predictionRepository.create(dto);
    return this.predictionRepository.save(prediction);
  }
  
  async savePredictionFromRaw(rawPrediction: any): Promise<Prediction> {
  const {
    product,
    brand,
    unit,
    days,
    tendency,
    alert_restock,
    forecast,
    metrics,
    sales_last_month,
    projected_sales,
    percent_change,
  } = rawPrediction;

  const createPredictionDto: CreatePredictionDto = {
    product,
    brand,
    unit,
    days,
    tendency,
    alert_restock,
    forecast,
    metrics,
    sales_last_month,
    projected_sales,
    percent_change,
  };

  return this.create(createPredictionDto);
}


  async findAll(): Promise<Prediction[]> {
    return this.predictionRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findByProduct(
    product: string,
    brand: string,
    unit: string,
  ): Promise<Prediction[]> {
    return this.predictionRepository.find({
      where: { product, brand, unit },
      order: { createdAt: 'DESC' },
    });
  }
}
