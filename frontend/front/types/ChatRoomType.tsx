// 삭제 예정 파일

export type roomType = "open" | "protected" | "private" | "dm";

export interface ConnectedUserI {
  id?: number;
  socketId: string;
  user: UserI;
}

export interface JoinedRoomI {
  id?: number;
  socketId: string;
  user: UserI;
  room: RoomI;
}

export interface MessageI {
  id?: number;
  text: string;
  user: UserI;
  room: RoomI; //roomId
  created_at: Date;
}

export interface RoomI {
  roomId: number;
  roomName: string;
  roomType: roomType;
  roomPass?: string; // hasPass
  roomOwner: number; //owner user의 id
  roomAdmins: number[]; //ids
  roomBanned: number[]; //ids
  users: UserEntity[]; // id, nickname
  // joinedUsers: JoinedRoomEntity[];
  // messages: MessageEntity[];
  // created_at?: Date;
  // updated_at?: Date;
}

export interface UserI {
  userProfile?: UserProfile;
  id: number;
  nickname: string;
  block_list: number[];
  friend_list: number[];
  rooms: RoomEntity[];
  connections: ConnectedUserEntity[];
  joinedRooms: JoinedRoomEntity[];
  messages: MessageEntity[];
}
