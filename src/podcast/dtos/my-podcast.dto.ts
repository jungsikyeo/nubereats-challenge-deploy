import { Field, ObjectType } from '@nestjs/graphql';
import { Podcast } from '../entities/podcast.entity';
import { CoreOutput } from '../../users/dtos/output.dto';

@ObjectType()
export class MyPodcastOutput extends CoreOutput {
  @Field(() => [Podcast])
  podcasts?: Podcast[];
}
