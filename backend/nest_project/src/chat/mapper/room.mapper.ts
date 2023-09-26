import { Injectable, Logger } from "@nestjs/common";
import { roomType } from "../types/roomTypes";
import { RoomCreateDTO, SimpleRoomDTO, SpecificRoomDTO } from "../dto/room.dto";
import { RoomEntity } from "../entities/room.entity";
import { RoomI } from "../interfaces/room.interface";
import { UserMapper } from "./user.mapper";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";

@Injectable()
export class RoomMapper{
  constructor(
    private readonly userMapper : UserMapper,
    @InjectRepository(RoomEntity)
    private readonly roomRepository : Repository<RoomEntity>,
    // private readonly roomService : RoomService,
    ){}
  
  private logger = new Logger('roomMapper');

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
    // entity.joinedUsers = [];
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
    // entity.joinedUsers = room_interface.joinedUsers;
    entity.messages = room_interface.messages;
    entity.created_at = null;
    
    return entity;
  
  }
  
  Create_simpleInterfaceToDto(interfaceI :RoomI)
  {
    const dto = new SimpleRoomDTO;
    dto.roomId = interfaceI.roomId;
    dto.roomName = interfaceI.roomName;
    dto.roomType = interfaceI.roomType;
    if (interfaceI.roomPass == undefined || interfaceI.roomPass === "undefined")
     dto.hasPass = false;
    else
      dto.hasPass = true;
    if(interfaceI.users === undefined || interfaceI.users === null)
      dto.joinUsersNum = 0;
    else
      dto.joinUsersNum = interfaceI.users.length;
  
    return dto;
  }
  
  async getRoomEntityWithUsers(roomId: number): Promise<RoomEntity> {
    const temp = await this.roomRepository.findOne({
      where: { roomId },
      relations: ['users'] //관련 엔터티도 함께 가져오겠다.
    });
    return temp;
  }

  async Create_specificInterfaceToDto(interfaceI :RoomI)
  {
    const dto = new SpecificRoomDTO;
    dto.roomId = interfaceI.roomId;
    dto.roomName = interfaceI.roomName;
    dto.roomType = interfaceI.roomType;
    if (interfaceI.roomPass == null)
     dto.hasPass = false;
    else
      dto.hasPass = true;
    // dto.hasPass = (interfaceI.roomPass !== undefined);
    dto.roomOwner = interfaceI.roomOwner;
    dto.roomAdmins = interfaceI.roomAdmins;
    dto.roomBanned = interfaceI.roomBanned;
    dto.users = await this.userMapper.Create_simpleDTOArrays(interfaceI.users);
    dto.created_at = interfaceI.created_at;

    return dto;
  }

  // Create_simpleInterfaceToDto(interfaceI :RoomI)
  // {
  //   const dto = new SimpleRoomDTO;
  //   dto.roomId = interfaceI.roomId;
  //   dto.roomName = interfaceI.roomName;
  //   dto.roomType = interfaceI.roomType;
  //   if (interfaceI.roomPass == undefined || interfaceI.roomPass === "undefined")
  //    dto.hasPass = false;
  //   else
  //     dto.hasPass = true;
  //   // dto.hasPass = (interfaceI.roomPass !== undefined);
  //   // dto.joinUsersNum = interfaceI.users.length;

  //   return dto;
  // }


    async Create_simpleEntityToDto(entity :RoomEntity)
    {
      const dto = new SimpleRoomDTO;
      dto.roomId = entity.roomId;
      dto.roomName = entity.roomName;
      dto.roomType = entity.roomType;
      if (entity.roomPass === null) 
        dto.hasPass = false;
      else
        dto.hasPass = true;
      // dto.hasPass = (entity.roomPass !== undefined);
      if (entity.users === undefined || entity.users === null)
      {
        const roomWithUsers = await this.getRoomEntityWithUsers(entity.roomId);
        if (roomWithUsers.users === undefined || roomWithUsers.users === null)
        {
          dto.joinUsersNum = 0;
        }
        else
          dto.joinUsersNum = roomWithUsers.users.length;
      }
      else
        dto.joinUsersNum = entity.users.length; 

      return dto;
    }

    async Create_simpleDTOArrays(entityArray :RoomEntity[])
    {
      let dtoArray : SimpleRoomDTO[] = [];
      if (entityArray === undefined)
        return dtoArray;
      for (const roomEntity of entityArray)
        dtoArray.push(await this.Create_simpleEntityToDto(roomEntity));
      return dtoArray;
    }
}