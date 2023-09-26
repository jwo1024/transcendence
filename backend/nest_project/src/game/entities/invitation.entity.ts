// data source 옵션에 추가해줘야 함 -> entities: [/game/user..]

import { BaseEntity, Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryColumn, PrimaryGeneratedColumn, Timestamp, Unique, UpdateDateColumn } from "typeorm";

@Entity()
export class InvitationEntity
{
	@PrimaryGeneratedColumn({type: 'integer'}) 
	invite_id: number;

	@Column({ type: 'integer', nullable: false })
	host_id: number;

	@Column({ type: 'integer', nullable: false })
	guest_id: number;

	// 여기 있는 게 더 맞긴 하네
	// @Column()
	// refuseGame: boolean = false;

	// @Column()
	// checkTimer: number = 0;
}
