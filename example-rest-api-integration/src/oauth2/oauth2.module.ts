import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { OAuth2Controller } from './oauth2.controller';
import { AuthMiddleware } from 'src/middleware/auth.middleware';
import { UserModule } from 'src/user/user.module';
import { OAuth2TokenService } from './oauth2token.service';
import { OAuth2Service } from './oauth2.service';
import { ConfigurationModule } from 'src/configuration/configuration.module';

@Module({
  controllers: [OAuth2Controller],
  imports: [ConfigurationModule, UserModule],
  exports: [OAuth2TokenService],
  providers: [OAuth2Service, OAuth2TokenService],
})
export class Oauth2Module implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes(OAuth2Controller);
  }
}
