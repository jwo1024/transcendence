import { userStatus } from "../../user/profile/user-profile.entity";

export class SimpleUserDto {
    id: number; 
    nickname: string;
}

export class SimpleProfileDto {
	id : number;
	nickname : string;
	status : userStatus;
	ladder: number;
	wins: number;
	loses: number;
}