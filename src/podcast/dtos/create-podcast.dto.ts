import { Field, InputType, Int, ObjectType, PickType } from '@nestjs/graphql';
import { Podcast } from '../entities/podcast.entity';
import { CoreOutput } from './output.dto';
import { IsNumber } from 'class-validator';

@InputType()
export class CreatePodcastInput extends PickType(
  Podcast,
  ['title', 'category', 'description'],
  InputType,
) {}

@ObjectType()
export class CreatePodcastOutput extends CoreOutput {
  @Field((type) => Number, { nullable: true })
  @IsNumber()
  id?: number;
}
