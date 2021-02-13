import { Module } from '@nestjs/common';
import {
  EpisodeResolver,
  PodcastsResolver,
  ReviewResolver,
} from './podcasts.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Podcast } from './entities/podcast.entity';
import { Episode } from './entities/episode.entity';
import { Review } from './entities/review.entity';
import { PodcastsService } from './podcasts.service';

@Module({
  imports: [TypeOrmModule.forFeature([Podcast, Episode, Review])],
  providers: [
    PodcastsService,
    PodcastsResolver,
    EpisodeResolver,
    ReviewResolver,
  ],
})
export class PodcastsModule {}
