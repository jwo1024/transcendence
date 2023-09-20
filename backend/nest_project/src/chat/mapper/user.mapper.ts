import { Injectable } from "@nestjs/common";
import { UserEntity } from "../entities/user.entity";
import { SimpleUserDto } from "../dto/simpleUser.dto";
import { UserI } from "../interfaces/user.interface";
import { ProfileService } from "src/user/profile/profile.service";

@Injectable()
export class UserMapper {

	constructor (
		private readonly profileService : ProfileService,
	){}
	Create_EntityToDto(entity :UserI, nickname : string){
		const dto = new SimpleUserDto;
		dto.id = entity.id;
		dto.nickname = nickname;
	  
		return dto;
	}
	
	async Create_simpleDTOArrays(entityArray :UserI[]){
		const dtoArray : SimpleUserDto[] = [];
		if (entityArray.length === 0)
		  return dtoArray;
		for (const user of entityArray)
		{
			const nickname = (await this.profileService.getUserProfileById(user.id)).nickname;
		  dtoArray.push(this.Create_EntityToDto(user, nickname));
		}
		return dtoArray;
	  }
	
}