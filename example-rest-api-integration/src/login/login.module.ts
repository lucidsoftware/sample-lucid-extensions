import { Module } from '@nestjs/common';
import { LoginController } from './login.controller';
import { UserModule } from 'src/user/user.module';

@Module({
  controllers: [LoginController],
  imports: [UserModule],
})
export class LoginModule {}
