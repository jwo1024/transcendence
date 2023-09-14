import { roomType } from "../types/roomTypes";

export class RoomCreateDTO {

  roomName: string;

  roomType: roomType;

  roomPass?: string;

}

export class RoomJoinDTO 
{

  roomId: number;

  roomPass?: string;

}

export class RoomInviteDTO 
{

  targetUserId: number;

  roomId: number;

}

export class AdminRelatedDTO 
{
  targetUserId: number;

  roomId: number;
}