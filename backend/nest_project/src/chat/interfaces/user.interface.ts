import { Socket } from "socket.io";
import { RoomEntity } from "../entities/room.entity";
import { ConnectedUserEntity } from "../entities/connected-user.entity";
import { JoinedRoomEntity } from "../entities/joined-room.entity";
import { MessageEntity } from "../entities/message.entity";

export interface UserI {
	id?: number;
	nick_name?: string;
	// email: string;
	// password?: string;
}

// export interface UserI 
// {
// 	id: number; 
// 	nick_name: string;
// 	block_list : number[];
// 	friend_list : number[];
// 	socket?: Socket;
// 	rooms: RoomEntity[]
// 	connections: ConnectedUserEntity[];
// 	joinedRooms: JoinedRoomEntity[];
// 	messages: MessageEntity[];
// }
