import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
// import { UserService } from './services/user/user.service';
import { ConnectedUserService } from './services/connected-user/connected-user.service';
import { UserService } from './services/user/user.service';

@Module({
	imports: [],
	controllers: [],
	providers: [ChatGateway, UserService, ConnectedUserService],
})
export class ChatModule {}
