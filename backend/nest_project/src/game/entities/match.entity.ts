// data source 옵션에 추가해줘야 함 -> entities: [/game/user..]

import { UserProfile } from "src/user/profile/user-profile.entity";
import { BaseEntity, Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryColumn, PrimaryGeneratedColumn, Timestamp, Unique, UpdateDateColumn } from "typeorm";
import { FindOneOptions } from "typeorm";

@Entity()
// @Unique('id')
export class MatchEntity
{
	@PrimaryGeneratedColumn({type: 'integer'}) 
	match_id: number;

	// [ ladder, normal, speedUp, smallBall ]
	// < ladder game >: only normal
	// < friendly game >: 3 modes (normal, speedUp, smallBall, enjoyAll)
	@Column({ type: 'varchar', nullable: false })
	game_type: string;

	@Column({ type: 'integer', nullable: false })
	playerLeft: number;

	@Column({ type: 'integer', nullable: false })
	playerRight: number;

	@Column({ type: 'integer', nullable: false })
	scoreLeft: number = 0;

	@Column({ type: 'integer', nullable: false })
	scoreRight: number = 0;

	@CreateDateColumn({name: 'create_time'})
	createTime: Timestamp;
}
