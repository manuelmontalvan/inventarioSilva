import { DataSource } from 'typeorm';
import { User } from './users/user.entity'; // Ajusta según ruta real
import { Role } from './users/roles/entities/role.entity'; // Ajusta según ruta real

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5433', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'eros2021',
  database: process.env.DB_NAME || 'inventarioSilva',
  entities: [User, Role], // Lista todas las entidades que uses  
  synchronize: false, // Siempre false para producción
  logging: false,
});
