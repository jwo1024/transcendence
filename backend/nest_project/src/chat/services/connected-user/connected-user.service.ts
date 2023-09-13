import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConnectedUserEntity } from 'src/chat/entities/connected-user.entity';
import { UserEntity } from 'src/chat/entities/user.entity';
import { ConnectedUserI } from 'src/chat/interfaces/connected-user.interface';
import { UserI } from 'src/chat/interfaces/user.interface';
import { Repository } from 'typeorm';


@Injectable()
export class ConnectedUserService {

  constructor(
    @InjectRepository(ConnectedUserEntity)
    private readonly connectedUserRepository: Repository<ConnectedUserEntity>
  ) { }

  async create(connectedUser: ConnectedUserI): Promise<ConnectedUserI> {
    return this.connectedUserRepository.save(connectedUser);
  }

  async getAllUser(): Promise<ConnectedUserI[]> {
    return await this.connectedUserRepository.find();
  }

  async findByUser(user: UserI): Promise<ConnectedUserI> {
    return this.connectedUserRepository.findOne({ 
      where: {user: { id: user.id}}
    });
  }

  async deleteBySocketId(socketId: string) {
    return this.connectedUserRepository.delete({ socketId });
  }

  async deleteAll() {
    await this.connectedUserRepository
      .createQueryBuilder()
      .delete()
      .execute();
  }

}
