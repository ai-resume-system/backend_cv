import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { SearchIndexService } from './search-index.service';

@Module({
  imports: [
    ElasticsearchModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        node: configService.get<string>('ELASTICSEARCH_NODE') || 'http://localhost:9200',
        auth: configService.get<string>('ELASTICSEARCH_USERNAME')
          ? {
              username: configService.get<string>('ELASTICSEARCH_USERNAME') || '',
              password: configService.get<string>('ELASTICSEARCH_PASSWORD') || '',
            }
          : undefined,
      }),
    }),
  ],
  providers: [SearchIndexService],
  exports: [SearchIndexService],
})
export class SearchModule {}
