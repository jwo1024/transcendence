///// NEW with BACKEND  /////
export type roomType = "open" | "private" | "dm";

// waiting room
export interface SimpRoomI {
  roomId: number;
  roomName: string;
  roomType: roomType;
  hasPass: boolean;
  joinUsersNum: number; // only front? not in db
}

export interface SimpUserI {
  id: number;
  nickname: string;
}

// chat room
// make in DTO
export interface RoomI {
  roomId: number;
  roomName: string;
  roomType: roomType;
  roomPass?: string;
  roomOwner: number; //owner user의 id
  roomAdmins: number[]; //ids
  roomBanned: number[]; //idsx
  // users: UserEntity[];
  // joinedUsers: JinedRoomEntity[];
  // messages: MessageEntity[];
  created_at?: Date;
}

export interface MessageI {
  text: string;
  user: SimpUserI; // just id
  room: SimpRoomI; //roomId TODO : id만으로 .. !
  created_at: Date;
}

// SEND DTO (From Front to Back)
export interface RoomCreateDTO {
  roomName: string;
  roomType: roomType;
  roomPass?: string;
}

export interface RoomJoinDTO {
  roomId: number;
  roomPass?: string;
}

export interface MessageDTO {
  roomId: number;
  userId: number;
  text: string;
} // (보안 문제로 userId 빼는 것 고려중)

export interface RoomCreateDTO {
  roomName: string;
  roomType: roomType;
  roomPass?: string;
}

export interface RoomInviteDTO {
  targetUserId: number;
  roomId: number;
}
