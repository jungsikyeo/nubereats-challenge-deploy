import { Get, Req } from "@nestjs/common";
import { Controller } from "@nestjs/common";

@Controller("spotify")
export class SpotifyController {
  @Get("/api/auth")
  async spotifyAPI(@Req() request) {
    const SpotifyWebApi = require("spotify-web-api-node");
    const scopes = ["user-read-private", "user-read-email"],
      redirectUri = "http://localhost:4000/spotify/api/callback",
      clientId = "65cf8050ccf243b3a3b78d3f711fe6f2",
      clientSecret = "009a72ffec404e5c94c5d8bc2859264a",
      state = "some-state-of-my-choice",
      showDialog = true,
      responseType = "token";

    const spotifyApi = new SpotifyWebApi({
      clientId: clientId,
      clientSecret: clientSecret,
      redirectUri: redirectUri,
    });

    const authorizeURL = spotifyApi.createAuthorizeURL(
      scopes,
      state,
      showDialog,
      responseType
    );

    let items = {};
    if (authorizeURL) {
      items = spotifyApi
        .clientCredentialsGrant()
        .then(
          async (data) => {
            console.log(data.body["access_token"]);
            await spotifyApi.setAccessToken(data.body["access_token"]);
          },
          (err) => {
            console.log("Something went wrong!", err);
          }
        )
        .then(
          async () =>
            await spotifyApi.searchTracks(request?.query?.searchText).then(
              (data) => {
                let trackList = [];
                data.body.tracks.items.forEach((item) => {
                  //console.log(item);
                  /*console.log(
                    item.name,
                    item.album.images[0].url,
                    item.duration_ms
                  );*/
                  let track = {
                    title: item.name,
                    imageUrl: item.album.images[0].url,
                    playTime: item.duration_ms,
                  };
                  trackList.push(track);
                });
                console.log(trackList);
                console.log(data.body.tracks.next);
                return {
                  tracks: trackList,
                  nextUrl: data.body.tracks.next,
                };
              },
              (err) => {
                console.error(err);
              }
            )
        );
    }
    return items;
  }
}
