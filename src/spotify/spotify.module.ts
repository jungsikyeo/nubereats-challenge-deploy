import { Module } from "@nestjs/common";
import { SpotifyController } from "./spotify.controller";

@Module({
  imports: [SpotifyModule],
  controllers: [SpotifyController],
})
export class SpotifyModule {}
