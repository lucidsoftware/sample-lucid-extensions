import { AppController } from './app.controller';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { Oauth2Module } from './oauth2/oauth2.module';
import { UserModule } from './user/user.module';
import { ApiModule } from './api/api.module';
import { AuthMiddleware } from './middleware/auth.middleware';
import { LoginModule } from './login/login.module';

@Module({
  imports: [Oauth2Module, UserModule, ApiModule, LoginModule],
  controllers: [AppController],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes(AppController);
  }
}
