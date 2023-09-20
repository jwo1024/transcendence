// import { Socket } from "socket.io";
import { RoomEntity } from "../entities/room.entity";
import { ConnectedUserEntity } from "../entities/connected-user.entity";
import { JoinedRoomEntity } from "../entities/joined-room.entity";
import { MessageEntity } from "../entities/message.entity";
import { UserProfile } from "../../user/profile/user-profile.entity";

export interface UserI {
	userProfile: UserProfile;
	id: number;
	// nickname: string;
	// block_list : number[];
	// friend_list : number[];
	rooms: RoomEntity[]
	connections: ConnectedUserEntity[];
	joinedRooms: JoinedRoomEntity[];
	messages: MessageEntity[];

}