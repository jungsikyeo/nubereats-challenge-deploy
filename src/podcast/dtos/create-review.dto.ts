import { Entity } from 'typeorm';
import { Field, InputType, Int, ObjectType, PickType } from '@nestjs/graphql';
import { CoreOutput } from './output.dto';
import { IsInt } from 'class-validator';
import { Review } from '../entities/review.entity';

@Entity()
@InputType()
export class CreateReviewInput extends PickType(
  Review,
  ['title', 'reviewText'],
  InputType,
) {
  @Field((type) => Int)
  @IsInt()
  podcastId: number;
}

@ObjectType()
export class CreateReviewOutput extends CoreOutput {
  @Field((type) => Int, { nullable: true })
  id?: number;
}
