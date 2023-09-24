import { Injectable } from "@nestjs/common";
// import { UserEntity } from "../entities/user.entity";
import { SimpleProfileDto, SimpleUserDto } from "../dto/simpleUser.dto";
import { UserI } from "../interfaces/user.interface";
import { ProfileService } from "src/user/profile/profile.service";
import { UserProfile } from "src/user/profile/user-profile.entity";

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
		if (entityArray === undefined || entityArray === null || entityArray.length === 0)
		  return dtoArray;
		for (const user of entityArray)
		{
			const nickname = (await this.profileService.getUserProfileById(user.id)).nickname;
		  dtoArray.push(this.Create_EntityToDto(user, nickname));
		}
		return dtoArray;
	  }

	  Create_simpleProfileEntityToDto(entity :UserProfile)
	  {
		const dto = new SimpleProfileDto;
		dto.id = entity.id;
		dto.nickname = entity.nickname;
		dto.status = entity.status;
		dto.ladder = entity.ladder;
		dto.wins = entity.wins;
		dto.loses = entity.loses;
		
		return dto;
	  }

	  async Create_simpleProfileDTOArrays(entityArray :UserProfile[])
	  {
		const dtoArray : SimpleProfileDto[] = [];
		if (entityArray.length === 0)
		  return dtoArray;
		for (const user of entityArray)
		  dtoArray.push(this.Create_simpleProfileEntityToDto(user));

		  return dtoArray;
	  }
	
}