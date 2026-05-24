// Cấu hình tự đông viết sql
import * as dotenv from 'dotenv';
import { join } from 'path';
import { DataSource } from 'typeorm';

dotenv.config({ path: '.env' });

export const AppDataSource = (): DataSource => {
  return new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    entities: [join(__dirname, './entities/*.orm-entity{.ts,.js}')], // Quét toàn bộ các file kết thúc bằng .orm-entity.ts để tự động map vào database
    migrations: [join(__dirname, './migrations/**/*{.ts,.js}')],
    synchronize: false,
    logging: ['error', 'warn'],
  });
};

export default AppDataSource();
