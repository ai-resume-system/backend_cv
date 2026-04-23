import { NestFactory } from '@nestjs/core';
import { AppModule } from 'src/app.module';
import { DataSource } from 'typeorm';
import { seedAdmin } from './user.seeder';
import { seedCareerCategories } from './career-category.seeder';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const dataSource = app.get(DataSource);

  console.log('Start seeding...');

  await seedAdmin(dataSource);
  await seedCareerCategories(dataSource);

  console.log('Seeding done');

  await app.close();
}

bootstrap();
