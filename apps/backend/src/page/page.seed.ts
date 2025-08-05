import { Injectable, OnModuleInit } from '@nestjs/common';
import { PagesService } from './page.service';
import { CreatePageDto } from './dto/create-page.dto';

@Injectable()
export class PageSeed implements OnModuleInit {
  constructor(private readonly pagesService: PagesService) {}

  private readonly pagesToSeed: CreatePageDto[] = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Usuarios', path: '/users' },
    { name: 'Roles', path: '/roles' },
    { name: 'Productos', path: '/products' },
    { name: 'Marcas', path: '/products/brand' },
    { name: 'Categorías', path: '/products/category' },
    { name: 'Unidades de Medida', path: '/products/unitOfMeasure' },
    { name: 'Localidades', path: '/products/localities' },
    { name: 'Stock', path: '/products/stock' },
    { name: 'Compras', path: '/purchases' },
    { name: 'Proveedores', path: '/purchases/suppliers' },
    { name: 'Historial de compras ', path: '/purchases-history' },
    { name: 'Ventas', path: '/sales' },
    { name: 'Clientes', path: '/sales/customers' },
    { name: 'Historial de ventas ', path: '/sales-history' },
    { name: 'Gestion Bodega', path: '/inventory' },
    { name: 'Margen', path: '/config/margins-and-taxes' },
    { name: 'Páginas', path: '/config/page' },
    { name: 'Analisis Predictivo', path: '/analytics' },
  ];

  async onModuleInit() {
    for (const page of this.pagesToSeed) {
      const existingPages = await this.pagesService.findAll();

      const exists = existingPages.some(
        (p) => p.name === page.name || p.path === page.path,
      );

      if (!exists) {
        await this.pagesService.create(page);
        console.log(`✅ Página "${page.name}" registrada.`);
      } else {
        console.log(`ℹ️ Página "${page.name}" ya existe.`);
      }
    }
  }
}
