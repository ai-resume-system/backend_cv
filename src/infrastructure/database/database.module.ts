import { Global, Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { DataSource } from 'typeorm';

@Global()
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE'),
        entities: [join(__dirname, './entities/*.orm-entity{.ts,.js}')],
        synchronize: false,
        logging: ['error', 'warn'],
      }),
      dataSourceFactory: async (options) => {
        try {
          if (!options)
            throw new Error('TypeORM DataSourceOptions not provided');
          const dataSource = await new DataSource(options).initialize();
          Logger.log('[CONNECTED]', 'DatabaseModule');
          return dataSource;
        } catch (error) {
          Logger.error(
            `[FAILED CONNECTED]: ${error.message}`,
            error.stack,
            'DatabaseModule',
          );
          throw error;
        }
      },
    }),
    TypeOrmModule.forFeature([]),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
