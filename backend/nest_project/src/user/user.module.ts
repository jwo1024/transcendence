import { Module } from '@nestjs/common';
import { ProfileModule } from './profile/profile.module';
import { LoginModule } from './login/login.module';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserProfile } from './profile/user-profile.entity';

@Module({
    imports: [ProfileModule, LoginModule, TypeOrmModule.forFeature([UserProfile])],
    controllers: [UserController]
})
export class UserModule {}