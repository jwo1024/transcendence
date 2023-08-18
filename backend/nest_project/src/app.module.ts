import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeORMConfig } from './configs/typeorm.config';
import { ChatModule } from './chat/chat.module';
import { GameModule } from './game/game.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [TypeOrmModule.forRoot(typeORMConfig),
            ChatModule,
            GameModule,
            AuthModule,
  ],
  providers: [],
  // controllers: [AppController],
  // providers: [AppService], //사실 얘네는 필요 없을 듯.
})
export class AppModule {}
