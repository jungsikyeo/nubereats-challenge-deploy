import { ObjectType, Field } from "@nestjs/graphql";
import { IsNumber, IsOptional, IsString } from "class-validator";
import { Column, Entity, ManyToOne, RelationId } from "typeorm";
import { CoreEntity } from "./core.entity";
import { Podcast } from "./podcast.entity";

@Entity()
@ObjectType()
export class Episode extends CoreEntity {
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
  imageUrl?: string;

  @Column({ nullable: true })
  @Field((type) => Number, { nullable: true })
  @IsNumber()
  @IsOptional()
  playTime?: number;

  @ManyToOne(() => Podcast, (podcast) => podcast.episodes, {
    onDelete: "CASCADE",
  })
  @Field((type) => Podcast)
  podcast: Podcast;
}
