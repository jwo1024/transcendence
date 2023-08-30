// import { Module } from '@nestjs/common';
import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeORMConfig } from './configs/typeorm.config';
import { ChatModule } from './chat/chat.module';
import { GameModule } from './game/game.module';
import { UserModule } from './user/user.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [TypeOrmModule.forRoot(typeORMConfig),
            ChatModule,
            GameModule,
            UserModule,
            ConfigModule.forRoot()
  ],
  providers: [],
  // controllers: [AppController],
  // providers: [AppService], //사실 얘네는 필요 없을 듯.
})
export class AppModule {
  // configure(consumer: MiddlewareConsumer) {
  //   consumer
  //     // // .apply(AuthMiddleware)
  //     // .exclude(
  //     //   { path: '/api/users', method: RequestMethod.POST},
  //     //   {path: '/api/users/login', method: RequestMethod.POST}
  //     // )
  //     .forRoutes('')
  // }
}
