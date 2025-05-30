import { Injectable, OnModuleInit } from '@nestjs/common';
import { UnitsService } from './units.service';

@Injectable()
export class UnitsSeed implements OnModuleInit {
  constructor(private readonly unitsService: UnitsService) {}

  async onModuleInit() {
    const defaultUnits = [
      { name: 'Kilogramo', abbreviation: 'kg' },
      { name: 'Gramo', abbreviation: 'g' },
      { name: 'Litro', abbreviation: 'L' },
      { name: 'Mililitro', abbreviation: 'ml' },
      { name: 'Metro', abbreviation: 'm' },
      { name: 'Centímetro', abbreviation: 'cm' },
      { name: 'Unidad', abbreviation: 'ud' },
      { name: 'Caja', abbreviation: 'caja' },
      { name: 'Paquete', abbreviation: 'paq' },
      { name: 'Docena', abbreviation: 'doc' },
      { name: 'Galón', abbreviation: 'gal' },
      { name: 'Saco', abbreviation: 'saco' },
    ];

    for (const unit of defaultUnits) {
      const exists = await this.unitsService.findByName(unit.name);
      if (!exists) {
        await this.unitsService.create(unit);
        console.log(`✔ Unidad creada: ${unit.name}`);
      } else {
        console.log(`⏩ Unidad ya existe: ${unit.name}`);
      }
    }
  }
}
