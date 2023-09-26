///// NEW with BACKEND  /////

// USER DTO
// - SimpUserI : SimpleUserDTO
export interface SimpUserI {
  id?: number;
  nickname: string;
}
export interface UserI {
  nickname: string;
  state: string;
  avatarSrc: string;
  ladder: number;
  wins: number;
  loses: number;
}

// ROOM DTO
export type roomType = "open" | "private" | "dm";
// - SimpRoomI : SimpleRoomDTO
export interface SimpRoomI {
  roomId: number;
  roomName: string;
  roomType: roomType;
  hasPass: boolean;
  joinUsersNum: number; // only front? not in db
}
export interface RoomI {
  roomId: number;
  roomName: string;
  roomType: roomType;
  hasPass: boolean;
  roomOwner: number; //owner user의 id
  roomAdmins: number[];
  roomBanned: number[];
  users: SimpUserI[];
  created_at?: Date;
}

export interface RoomCreateDTO {
  // SEND DTO (From Front to Back)
  roomName: string;
  roomType: roomType;
  roomPass?: string;
}

export interface RoomJoinDTO {
  roomId: number;
  roomPass?: string;
}

export interface RoomInviteDTO {
  targetUserNickname: string;
  roomId: number;
}

export interface RoomleaveDTO {
  roomId: number;
}


// MessageDTO
// - RecvMessageDTO : MessageI
export interface RecvMessageDTO {
  id: number;
  text: string;
  user: SimpUserI; // just id
  room: SimpRoomI; //roomId TODO : id만으로 .. !
  created_at: Date;
}
// - SendMessageDTO : MessageDTO
export interface SendMessageDTO {
  roomId: number;
  userId: number;
  text: string;
}

// Admin Request DTO
export interface AdminRelatedDTO {
  targetUserId: number;
  roomId: number;
}

// Response DTO
export interface ResponseDTO {
  success: boolean; // true : success(no msg), false : fail
  message?: string;
  roomId?: number;
}
