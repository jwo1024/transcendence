import { Injectable } from "@nestjs/common";

//Datas
import { MessageDTO } from "../dto/message.dto"; 
import { MessageEntity } from "../entities/message.entity"; 

//Services
import { RoomService } from "../services/room/room.service";
import { UserService } from "../services/user/user.service";

//Mappers
import { RoomMapper } from "./room.mapper";


@Injectable()
export class MessageMapper{

  constructor (
    private readonly roomService : RoomService,
    private readonly userService : UserService,
    private roomMapper : RoomMapper,
    ){};
  
//  Create_entityToDto(entity :MessageEntity){
//     const dto = new MessageDTO;
//     dto.roomName = entity.roomName;
//     dto.roomPass = entity.roomPass;
//     dto.roomType = entity.roomType;
//     return dto;
//   }
  
//userEntity를 userId 가지고 찾을 일이 아니고, socket에 주입되어있는 Entity나 id로 하는게
//보안상 맞는것 같다!!!
 async Create_dtoToEntity(dto: MessageDTO) : Promise<MessageEntity> {
    const entity = new MessageEntity();
    
    const roomtemp = this.roomMapper.Create_InterfcaeToEntity(await this.roomService.getRoom(dto.roomId));
    entity.room = roomtemp;
    
    const usertemp = await this.userService.getOne(dto.userId);
    entity.user = usertemp;

    entity.text = dto.text;

    return entity;

  }

}