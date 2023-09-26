import { userStatus } from "../../user/profile/user-profile.entity";

//jchoi 
export class SimpleUserDto {

    id: number; 

    nickname: string;  //not null not undefined

}

export class SimpleProfileDto {
	id : number;
	nickname : string;
	status : userStatus;
	ladder: number;
	wins: number;
	loses: number;``
}