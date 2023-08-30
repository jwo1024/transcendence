import { Module } from '@nestjs/common';
import { ProfileModule } from './profile/profile.module';
import { LoginModule } from './login/login.module';

@Module({
    imports: [ProfileModule, LoginModule]
})
export class UserModule {}