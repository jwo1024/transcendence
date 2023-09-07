import { Injectable } from "@nestjs/common";
import { roomType } from "../types/roomTypes";
import { RoomCreateDTO } from "../dto/room-create.dto";
import { RoomEntity } from "../entities/room.entity";

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
}