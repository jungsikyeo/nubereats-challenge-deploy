import { Get, Req } from "@nestjs/common";
import { Controller } from "@nestjs/common";
import axios from "axios";

const SpotifyWebApi = require("spotify-web-api-node");
const scopes = [
    "user-read-private",
    "user-read-email",
    "streaming",
    "user-read-playback-state",
    "user-modify-playback-state",
  ],
  redirectUri =
    "https://nuber-eats-yjs-backend.herokuapp.com/spotify/api/callback/",
  //clientId = "65cf8050ccf243b3a3b78d3f711fe6f2",
  //clientSecret = "009a72ffec404e5c94c5d8bc2859264a",
  clientId = "991d607907674184a338de482984d7ef",
  clientSecret = "d89b8645c5d845198979b9b967beff09",
  state = "some-state-of-my-choice",
  showDialog = true,
  responseType = "token";

const spotifyApi = new SpotifyWebApi({
  clientId,
  clientSecret,
  redirectUri,
  scopes,
});

@Controller("spotify")
export class SpotifyController {
  @Get("/api/callback")
  getApiToken() {
    try {
      return axios.get("http://152.67.198.254:5000/token");
    } catch (error) {
      console.error(error);
    }
  }

  @Get("/api/auth")
  async spotifyAPI(@Req() request) {
    let items = {};

    const authorizeURL = spotifyApi.createAuthorizeURL(
      scopes,
      state,
      showDialog,
      responseType
    );

    if (authorizeURL) {
      const token = await this.getApiToken();
      console.log(token.data);
      spotifyApi.setAccessToken(token.data);
      items = await spotifyApi.searchTracks(request?.query?.searchText).then(
        (data) => {
          let trackList = [];
          data.body.tracks.items.forEach((item) => {
            //console.log(item);
            let track = {
              title: item.name,
              category: item.album.name,
              imageUrl: item.album.images[0].url,
              playTime: item.duration_ms,
            };
            trackList.push(track);
          });
          return {
            episodes: trackList,
            nextUrl: data.body.tracks.next,
          };
        },
        (err) => {
          console.error(err);
        }
      );
    }
    return items;
  }
}
