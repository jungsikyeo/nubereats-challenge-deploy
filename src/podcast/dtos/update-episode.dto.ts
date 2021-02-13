import { InputType, Field } from "@nestjs/graphql";
import { IsString, IsOptional, IsNumber } from "class-validator";
import { EpisodesSearchInput } from "./podcast.dto";

@InputType()
export class UpdateEpisodeInput extends EpisodesSearchInput {
  @Field((type) => String, { nullable: true })
  @IsString()
  @IsOptional()
  readonly title?: string;

  @Field((type) => String, { nullable: true })
  @IsString()
  @IsOptional()
  readonly category?: string;

  @Field((type) => String, { nullable: true })
  @IsString()
  @IsOptional()
  imageUrl?: string;

  @Field((type) => Number, { nullable: true })
  @IsNumber()
  @IsOptional()
  playTime?: number;
}
