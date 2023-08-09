import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ApiService } from './api.service';
import { ApiController } from './api.controller';
import { Oauth2Module } from 'src/oauth2/oauth2.module';
import { AuthMiddleware } from 'src/middleware/auth.middleware';
import { ConfigurationModule } from 'src/configuration/configuration.module';

@Module({
  imports: [Oauth2Module, ConfigurationModule],
  controllers: [ApiController],
  providers: [ApiService],
})
export class ApiModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes(ApiController);
  }
}
