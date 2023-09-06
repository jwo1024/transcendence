import { BaseEntity, Column, Entity, PrimaryColumn } from "typeorm";

enum userStatus {
    offline,
    inGame,
    inChat
}

@Entity()
export class UserProfile extends BaseEntity {
    @PrimaryColumn({ type: 'integer', unique: true, nullable: false})
    id: number;

    @Column({ type: 'varchar', length: 20, unique: true, nullable: false})
    nickname: string;
    
    @Column({ type: 'enum', enum: userStatus, default: userStatus.offline})
    status: userStatus;
    
    @Column({ type: 'bytea'})
    avatar: Buffer;
    
    @Column({ type: 'boolean', default: false, nullable: false})
    enable2FA: boolean;
    
    @Column({ type: 'varchar'})
    data2FA: string;
    
    @Column({ type: 'integer', array: true, default: []})
    friend_list: number[];
    
    @Column({ type: 'integer', array: true, default: []})
    block_list: number[];

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP'})
    created_at: Date;  
} 