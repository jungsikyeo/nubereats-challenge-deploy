import { Episode } from './episode.entity';
import { ObjectType, Field } from '@nestjs/graphql';
import { IsString, IsOptional, Max } from 'class-validator';
import { Column, Entity, OneToMany, ManyToOne } from 'typeorm';
import { CoreEntity } from './core.entity';
import { Review } from './review.entity';
import { User } from '../../users/entities/user.entity';

@Entity()
@ObjectType()
export class Podcast extends CoreEntity {
  @Column()
  @Field((type) => String)
  @IsString()
  title: string;

  @Column()
  @Field((type) => String)
  @IsString()
  category: string;

  @Column({ nullable: true })
  @Field((type) => String, { nullable: true })
  @IsString()
  @IsOptional()
  description?: string;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.podcasts, {
    onDelete: 'CASCADE',
  })
  createdUser: User;

  @OneToMany(() => Episode, (episode) => episode.podcast, { eager: true })
  @Field((type) => [Episode])
  episodes: Episode[];

  @OneToMany(() => Review, (review) => review.podcast)
  @Field((type) => [Review], { nullable: true })
  reviews?: Review[];
}
