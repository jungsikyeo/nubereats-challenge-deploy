import {
  PaginationInput,
  PaginationOutput,
} from '../../common/dtos/pagination.dto';
import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { Podcast } from '../entities/podcast.entity';

@InputType()
export class SearchPodcastInput extends PaginationInput {
  @Field((type) => String, { nullable: true })
  titleSearch?: string;
}

@ObjectType()
export class SearchPodcastOutput extends PaginationOutput {
  @Field((type) => [Podcast], { nullable: true })
  podcasts?: Podcast[];
}
