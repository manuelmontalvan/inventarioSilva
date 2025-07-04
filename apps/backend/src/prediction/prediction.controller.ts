import { Controller, Post, Get, Body, Query } from '@nestjs/common';
import { PredictionService } from './prediction.service';
import { CreatePredictionDto } from './dto/create-prediction.dto';

@Controller('predictions')
export class PredictionController {
  constructor(private readonly predictionService: PredictionService) {}

  @Post()
  async create(@Body() createPredictionDto: CreatePredictionDto) {
    return this.predictionService.create(createPredictionDto);
  }

  @Get()
  async findAll() {
    return this.predictionService.findAll();
  }

  @Get('by-product')
  async findByProduct(
    @Query('product') product: string,
    @Query('brand') brand: string,
    @Query('unit') unit: string,
  ) {
    return this.predictionService.findByProduct(product, brand, unit);
  }
   @Post()
  async savePrediction(@Body() dto: CreatePredictionDto) {
    const prediction = await this.predictionService.create(dto);
    return {
      success: true,
      message: 'Prediction saved successfully',
      data: prediction,
    };
  }
}
