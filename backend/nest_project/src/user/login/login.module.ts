import { Module } from '@nestjs/common';
import { LoginController } from './login.controller';
import { LoginService } from './login.service';
import { ConfigService } from '@nestjs/config';
import { ProfileService } from '../profile/profile.service';
import { ProfileModule } from '../profile/profile.module';
import { UserProfile } from '../profile/user-profile.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([UserProfile])],
  controllers: [LoginController],
  providers: [LoginService, ConfigService, ProfileService]
})
export class LoginModule {}