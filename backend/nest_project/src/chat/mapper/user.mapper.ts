import { Injectable } from "@nestjs/common";
import { UserEntity } from "../entities/user.entity";
import { SimpleUserDto } from "../dto/simpleUser.dto";
import { UserI } from "../interfaces/user.interface";

@Injectable()
export class UserMapper {
	Create_EntityToDto(entity :UserI){
		const dto = new SimpleUserDto;
		dto.id = entity.id;
		dto.nickname = entity.nickname;
	  
		return dto;
	}
	
	Create_simpleDTOArrays(entityArray :UserI[]){
		const dtoArray : SimpleUserDto[] = [];
		if (entityArray.length === 0)
		  return dtoArray;
		for (const roomEntity of entityArray)
		{
		  dtoArray.push(this.Create_EntityToDto(roomEntity));
		}
		return dtoArray;
	  }
	
}