import { InputType, ObjectType, Field } from '@nestjs/graphql';
import { CoreOutput } from './output.dto';

@InputType()
export class ChangeSubscribeInput {
  @Field((type) => Number)
  podcastId: number;
}

@ObjectType()
export class ChangeSubscribeOutput extends CoreOutput {}
