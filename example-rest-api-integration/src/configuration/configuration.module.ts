import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { join } from 'path';
import { AppConfig } from './app.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: join(__dirname, '..', '..', 'default.env'),
    }),
  ],
  exports: [AppConfig],
  providers: [AppConfig],
})
export class ConfigurationModule {}
