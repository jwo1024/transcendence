import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';
import { ProfileService } from '../profile/profile.service';
import { UserProfile } from '../profile/user-profile.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { UserEntity } from '../../chat/entities/user.entity';
import { UserService } from '../../chat/services/user/user.service';
import { TfaService } from '../tfa/tfa.service';

@Module({
  imports: [ ServeStaticModule.forRoot({
    rootPath: join(__dirname, '..', 'profile', 'images'),
  }),
    TypeOrmModule.forFeature([UserProfile, UserEntity]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: 'plzsaveus',
      signOptions: { expiresIn: 60 * 60,}
    })],
  controllers: [AuthController],
  providers: [AuthService, ConfigService, ProfileService, JwtStrategy,UserService, TfaService],
  exports: [JwtStrategy, PassportModule]

})
export class AuthModule {}
