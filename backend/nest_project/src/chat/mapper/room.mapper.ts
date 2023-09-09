import { Injectable } from "@nestjs/common";
import { roomType } from "../types/roomTypes";
import { RoomCreateDTO } from "../dto/room.dto";
import { RoomEntity } from "../entities/room.entity";
import { RoomI } from "../interfaces/room.interface";

@Injectable()
export class RoomMapper{
  
 Create_entityToDto(entity :RoomEntity){
    const dto = new RoomCreateDTO;
    dto.roomName = entity.roomName;
    dto.roomPass = entity.roomPass;
    dto.roomType = entity.roomType;
  
    return dto;
  
  }
  
 Create_dtoToEntity(dto: RoomCreateDTO){
    const entity = new RoomEntity();
    entity.roomName = dto.roomName;
    if(dto.roomPass !== undefined)
      entity.roomPass = dto.roomPass;
    entity.roomType = dto.roomType;
    entity.joinedUsers = [];
    entity.users = [];
    entity.roomAdmins = [];
  
    return entity;
  
  }

  Create_InterfcaeToEntity(room_interface : RoomI){
    const entity = new RoomEntity;
    entity.roomId = room_interface.roomId;
    entity.roomName = room_interface.roomName;
    entity.roomType = room_interface.roomType;
    entity.roomPass = room_interface.roomPass;
    entity.roomOwner = room_interface.roomOwner;
    entity.roomAdmins = room_interface.roomAdmins;
    entity.roomBanned = room_interface.roomBanned;
    entity.users = room_interface.users;
    entity.joinedUsers = room_interface.joinedUsers;
    entity.messages = room_interface.messages;
    entity.created_at = null;
    
    return entity;
  
  }
}