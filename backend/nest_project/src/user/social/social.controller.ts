import { BadRequestException, Controller, Get, HttpStatus, Param, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ProfileService } from '../profile/profile.service';
import { FriendDto } from './dto/social.dto';

@Controller('social')
@UseGuards(AuthGuard())
export class SocialController {
    constructor(
        private profileService: ProfileService,
        ) {}
        
        @Get('friend/list')
        async getFriendList(@Req() req, @Res() res) : Promise<FriendDto[]> {
        const user = await this.profileService.getUserProfileById(req.user.userId);
        const { friend_list } = user;
        let friendDtoList: FriendDto[] = [];
        for (const id of friend_list) {
            const friend: FriendDto = await this.profileService.getUserProfileById(id);
            friendDtoList.push(friend);
        }
        return res.status(200).send(friendDtoList);
    }
    
    @Post('friend/add/:nickname')
    async addFriend(@Req() req, @Res() res, @Param('nickname') nickname: string) {
        if (!nickname)
            throw new BadRequestException('invalid nickname');
            const me = await this.profileService.getUserProfileById(req.user.userId);
            const target = await this.profileService.getUserProfileByNickname(nickname);
            
            if (!target)
                return res.status(HttpStatus.NOT_FOUND).send('no such user');
            else if (me.id === target.id)
                return res.status(HttpStatus.BAD_REQUEST).send('cannot add myself');
            else if (me.friend_list.includes(target.id))
                return res.status(HttpStatus.CONFLICT).send('already friend');
            else
            {   
                me.friend_list.push(target.id);
                const ret = await this.profileService.updateUserProfileById(me.id, me);
                console.log(ret);
                return res.status(200).ㄱsend('friend added');
         }
    }
    
    @Post('friend/delete/:id')
    async deleteFriend(@Req() req, @Res() res, @Param('id') targetId: number) {
        if (!targetId)
            throw new BadRequestException('invalid id');
        const me = await this.profileService.getUserProfileById(req.user.userId);
        const target = await this.profileService.getUserProfileById(targetId);
        if (!target)
            throw new BadRequestException('no such user');
        else
        {
            me.friend_list = me.friend_list.filter(id => id !== target.id);
            this.profileService.updateUserProfileById(me.id, me);
            return res.status(200).send('friend deleted');
        }
    }
    
    @Get('block/list')
    async getBlockList(@Req() req, @Res() res) : Promise<FriendDto[]> {
        const user = await this.profileService.getUserProfileById(req.user.userId);
        const { block_list } = user;
        let blockedDtoList: FriendDto[] = [];
        for (const id of block_list) {
            const blocked: FriendDto = await this.profileService.getUserProfileById(id);
            blockedDtoList.push(blocked);
        }
        return res.status(200).send(blockedDtoList);
    }

    @Post('block/add/:nickname')
    async addBlock(@Req() req, @Res() res, @Param('nickname') nickname: string) {
        if (!nickname)
        throw new BadRequestException('invalid nickname');
        const me = await this.profileService.getUserProfileById(req.user.userId);
        const target = await this.profileService.getUserProfileByNickname(nickname);
        
        if (!target)
            return res.status(HttpStatus.NOT_FOUND).send('no such user');
        else if (me.id === target.id)
            return res.status(HttpStatus.BAD_REQUEST).send('cannot add myself');
        else if (me.block_list.includes(target.id))
            return res.status(HttpStatus.CONFLICT).send('already blocked');
        else
        {   
            me.block_list.push(target.id);
            const ret = await this.profileService.updateUserProfileById(me.id, me);
            console.log(ret);
            return res.status(200).send('friend added');
        }
    }
    
    @Post('block/delete/:id')
    async deleteBlock(@Req() req, @Res() res, @Param('id') targetId: number) {
        if (!targetId)
            throw new BadRequestException('invalid id');
        const me = await this.profileService.getUserProfileById(req.user.userId);
        const target = await this.profileService.getUserProfileById(targetId);
        if (!target)
            throw new BadRequestException('no such user');
        else
        {
            me.block_list = me.block_list.filter(id => id !== target.id);
            this.profileService.updateUserProfileById(me.id, me);
            return res.status(200).send('block deleted');
        }
    }
}