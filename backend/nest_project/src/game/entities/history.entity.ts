// data source 옵션에 추가해줘야 함 -> entities: [/game/user..]

import { UserProfile } from "src/user/profile/user-profile.entity";
import { BaseEntity, Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryColumn, PrimaryGeneratedColumn, Timestamp, Unique, UpdateDateColumn } from "typeorm";
import { FindOneOptions } from "typeorm";

@Entity()
// @Unique('id')
export class HistoryEntity
{
	@PrimaryGeneratedColumn({type: 'integer'}) 
	history_id: number;

	// todo: 래더 게임만 매치 저장할 거면 필요 없는 요소
	// [ ladder, original, custom_speedUp, custom_smallBall ]
	// < ladder game >: only original
	// < friendly game >: 3 modes (original, speedUp, smallBall)
	// @Column({ type: 'varchar', nullable: false })
	// game_type: string;

	// many to one?
	@ManyToOne(() => UserProfile, (user) => user.id) //???
	@Column({ type: 'integer', nullable: false })
	win_user_id: number;

	// many to one?
	@ManyToOne(() => UserProfile, (user) => user.id) //???
	@Column({ type: 'integer', nullable: false })
	lose_user_id: number;

	@Column({ type: 'integer', nullable: false })
	win_score: number = 0;

	@Column({ type: 'integer', nullable: false })
	lose_score: number = 0;

	@CreateDateColumn({name: 'create_time'})
	createTime: Timestamp;
}
