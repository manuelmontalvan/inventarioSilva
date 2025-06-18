/*
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Product } from '../entities/product.entity';
import { ProductSale } from '../../productSales/entities/product-sale.entity';
import { Cron, CronExpression } from '@nestjs/schedule'; // Para programar la tarea

@Injectable()
export class TrendAnalysisService {
  private readonly logger = new Logger(TrendAnalysisService.name);

  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(ProductSale)
    private productSaleRepository: Repository<ProductSale>,
  ) {}

  // Cron job que se ejecuta cada día a las 2 AM (ajusta según necesidad)
  @Cron(CronExpression.EVERY_DAY_AT_2AM, { name: 'analyzeProductTrends', timeZone: 'America/Guayaquil' })
  async handleCron(): Promise<void> {
    await this.analyzeAndSetProductTrends();
  }

  async analyzeAndSetProductTrends(): Promise<void> {
    this.logger.log('Iniciando análisis de tendencias de productos...');
    const products = await this.productRepository.find();

    for (const product of products) {
      const trend = await this.calculateProductTrend(product.id);
      if (product.current_trend !== trend) {
        product.current_trend = trend;
        await this.productRepository.save(product);
        this.logger.debug(`Tendencia de "${product.name}" (${product.id}) actualizada a: ${trend}`);
      }
    }
    this.logger.log('Análisis de tendencias completado.');
  }

  private async calculateProductTrend(productId: string): Promise<'growing' | 'declining' | 'stable'> {
    // Definir los períodos de tiempo para el análisis
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const twoMonthsAgoStart = new Date(now.getFullYear(), now.getMonth() - 2, 1);

    // Ventas del mes actual (hasta hoy)
    const salesCurrentMonth = await this.productSaleRepository.sum('quantity', {
      where: {
        product: { id: productId },
        sale_date: Between(currentMonthStart, now)
      }
    });

    // Ventas del mes pasado
    const salesLastMonth = await this.productSaleRepository.sum('quantity', {
      where: {
        product: { id: productId },
        sale_date: Between(lastMonthStart, currentMonthStart)
      }
    });

    // Ventas del mes anterior al pasado (hace dos meses)
    const salesTwoMonthsAgo = await this.productSaleRepository.sum('quantity', {
      where: {
        product: { id: productId },
        sale_date: Between(twoMonthsAgoStart, lastMonthStart)
      }
    });

    // Manejar casos de nulos y asegurar que sean números
    const currentSales = salesCurrentMonth || 0;
    const lastMonthSales = salesLastMonth || 0;
    const twoMonthsAgoSales = salesTwoMonthsAgo || 0;

    this.logger.debug(`Product ${productId}: Current Month Sales: ${currentSales}, Last Month Sales: ${lastMonthSales}, Two Months Ago Sales: ${twoMonthsAgoSales}`);

    // Lógica del algoritmo de tendencia
    // Esto es un ejemplo. Puedes hacerla tan compleja como necesites.
    // Podrías usar promedios móviles, comparación con el mismo período del año anterior, etc.

    // Basado en el cambio de ventas entre el último mes y el mes anterior
    if (lastMonthSales === 0 && currentSales > 0) {
        return 'growing'; // De no ventas a tener ventas
    } else if (lastMonthSales > 0 && currentSales === 0) {
        return 'declining'; // De tener ventas a no tener
    } else if (lastMonthSales === 0 && currentSales === 0) {
        return 'stable'; // No hay ventas en ninguno de los dos períodos
    }

    const percentageChange = ((currentSales - lastMonthSales) / lastMonthSales) * 100;

    if (percentageChange > 15) { // Crecimiento significativo
      return 'growing';
    } else if (percentageChange < -15) { // Caída significativa
      return 'declining';
    } else {
      return 'stable'; // Poca o ninguna variación
    }
  }
}*/