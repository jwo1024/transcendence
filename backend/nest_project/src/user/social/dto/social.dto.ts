import { userStatus } from "src/user/profile/user-profile.entity";

export class FriendDto {

    id: number;

    nickname: string;

    status: userStatus;

    ladder : number;

    wins : number;

    loses : number;
}