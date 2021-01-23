import { Module, RequestMethod, MiddlewareConsumer } from "@nestjs/common";
import { GraphQLModule } from "@nestjs/graphql";
import { PodcastsModule } from "./podcast/podcasts.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Podcast } from "./podcast/entities/podcast.entity";
import { Episode } from "./podcast/entities/episode.entity";
import { Review } from "./podcast/entities/review.entity";
import { User } from "./users/entities/user.entity";
import { UsersModule } from "./users/users.module";
import { JwtModule } from "./jwt/jwt.module";
import { JwtMiddleware } from "./jwt/jwt.middleware";
import { AuthModule } from "./auth/auth.module";

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: "postgres",
      url: "postgres://jdkxlflokyfkoq:9b0f850937c6c2a04a8fd523a33098f648d122c8166741ce78bc6814c06e4ac5@ec2-3-208-168-0.compute-1.amazonaws.com:5432/d7e9p4eo1hgvr1",
      synchronize: true,
      logging: process.env.NODE_ENV !== "test",
      ssl: { rejectUnauthorized: false },
      entities: [Podcast, Episode, User, Review]
    }),
    GraphQLModule.forRoot({
      autoSchemaFile: true,
      context: ({ req }) => {
        return { user: req["user"] };
      }
    }),
    JwtModule.forRoot({
      privateKey: "8mMJe5dMGORyoRPLvngA8U4aLTF3WasX"
    }),
    PodcastsModule,
    UsersModule,
    AuthModule
  ]
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(JwtMiddleware).forRoutes({
      path: "/graphql",
      method: RequestMethod.POST
    });
  }
}
