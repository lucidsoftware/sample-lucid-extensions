import { Module } from '@nestjs/common';
import { UserRepository } from './user.repository';

@Module({
  exports: [UserRepository],
  providers: [UserRepository],
})
export class UserModule {}
