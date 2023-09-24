import { Injectable } from "@nestjs/common";

//Datas
import { MessageDTO, SimpleMessageDTO } from "../dto/message.dto"; 
import { MessageEntity } from "../entities/message.entity"; 
import { MessageI } from "../interfaces/message.interface";

//Services
import { RoomService } from "../services/room/room.service";
import { UserService } from "../services/user/user.service";
import { ProfileService } from "src/user/profile/profile.service";

//Mappers
import { RoomMapper } from "./room.mapper";
import { UserMapper } from "./user.mapper";


@Injectable()
export class MessageMapper{

  constructor (
    private readonly roomService : RoomService,
    private readonly userService : UserService,
    private readonly profileService : ProfileService,
    private roomMapper : RoomMapper,
    private userMapper : UserMapper,
    ){};

//보안상 맞는것 같다!!!
 async Create_dtoToEntity(dto: MessageDTO, userId : number) : Promise<MessageEntity> {
    const entity = new MessageEntity();
    
    const roomtemp = this.roomMapper.Create_InterfcaeToEntity(await this.roomService.getRoom(dto.roomId));
    entity.room = roomtemp;
    if (userId === undefined)
    {
      entity.user = null;
    }
    else
    {
      const writerUser = await this.userService.getOne(userId);
      entity.user = writerUser;
    }

    entity.text = dto.text;

    return entity;
  }

  async Create_entityToSimpleDto(entity :MessageI, roomId : number)
   {
    const dto = new SimpleMessageDTO;

    dto.id = entity.id
    dto.text = entity.text;
    if (entity.user === null || entity.user === undefined)
    {
      dto.user = { id: undefined, nickname: "server"};
    }
    else
      dto.user = this.userMapper.Create_EntityToDto(entity.user, (await this.profileService.getUserProfileById(entity.user.id)).nickname);
    dto.created_at = entity.created_at;
    dto.roomId = roomId;
    
    return dto;
  }  

   async Create_simpleDTOArrays(entityArray :MessageI[], roomId : number)
   {
    const dtoArray : SimpleMessageDTO[] = [];
    if (entityArray.length === 0)
      return dtoArray;
    for (const messageEntity of entityArray)
    {
      dtoArray.push(await this.Create_entityToSimpleDto(messageEntity, roomId));
    }
    return dtoArray;
  }
}