import { BaseEntity, Column, Entity, OneToOne, PrimaryColumn, JoinColumn } from "typeorm";

import { UserEntity } from "../../chat/entities/user.entity";

export enum userStatus {
    offline,
    online,
    inGame,
    inChat
}

@Entity()
export class UserProfile extends BaseEntity {

  @OneToOne(() => UserEntity, userEntity => userEntity.userProfile)
  @JoinColumn({ name: 'user_profile_id' })
  userEntity: UserEntity;

    @PrimaryColumn({ type: 'integer', unique: true, nullable: false})
    id: number;

    @Column({ type: 'varchar', length: 20, unique: true, nullable: false})
    nickname: string;
    
    @Column({ type: 'enum', enum: userStatus, default: userStatus.offline})
    status: userStatus;
    
    
    @Column({ type: 'boolean', default: false, nullable: false})
    enable2FA: boolean;
    
    @Column({ type: 'varchar', nullable: true})
    data2FA: string;
    
    @Column({ type: 'integer', array: true, default: []})
    friend_list: number[];
    
    @Column({ type: 'integer', array: true, default: []})
    block_list: number[];
    
    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP'})
    created_at: Date;
    
    @Column({ type: 'integer', default: 1000})
    ladder: number;
    
    @Column({ type: 'integer', default: 0})
    wins: number;
    
    @Column({ type: 'integer', default: 0})
    loses: number;

    @Column({ type: 'bytea', default: null})
    avatar: Buffer;

    @Column({ type: 'integer', array: true, default: [] })
    recent_history: number[];
}