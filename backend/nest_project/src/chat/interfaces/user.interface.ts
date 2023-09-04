import { Socket } from "socket.io";
import { RoomEntity } from "../entities/room.entity";
import { ConnectedUserEntity } from "../entities/connected-user.entity";
import { JoinedRoomEntity } from "../entities/joined-room.entity";
import { MessageEntity } from "../entities/message.entity";

import { FindOneOptions } from "typeorm";
import { UserProfile } from "../entities/userprofile.entity";


export interface UserI {
	id: number;
	nickname: string;
	block_list : number[];
	friend_list : number[];
	rooms: RoomEntity[]
	connections: ConnectedUserEntity[];
	joinedRooms: JoinedRoomEntity[];
	messages: MessageEntity[];

}

// export interface UserI 
// {
// 	id: number; 
// 	nick_name: string;
// 	block_list : number[];
// 	friend_list : number[];
// 	socket?: Socket;
// }
