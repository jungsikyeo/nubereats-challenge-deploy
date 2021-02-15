import { Get, Req } from "@nestjs/common";
import { Controller } from "@nestjs/common";

@Controller("spotify")
export class SpotifyController {
  @Get("/api/callback")
  getApiCallback(@Req() request) {
    console.log(request.body);
    /*
    const SpotifyWebApi = require("spotify-web-api-node");
    const code = "MQCbtKe23z7YzzS44KzZzZgjQa621hgSzHN";
    const credentials = {
      clientId: "65cf8050ccf243b3a3b78d3f711fe6f2",
      clientSecret: "009a72ffec404e5c94c5d8bc2859264a",
      //Either here
      accessToken: code,
    };

    const spotifyApi = new SpotifyWebApi(credentials);

    //Or with a method
    spotifyApi.setAccessToken(code);*/

    return null;
  }

  @Get("/api/auth")
  spotifyAPI() {
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

    console.log(authorizeURL);

    if (authorizeURL) {
      //localStorage.setItem("spotify_access_token", "")

      spotifyApi.clientCredentialsGrant().then(
        function (data) {
          console.log("The access token is " + data.body["access_token"]);
          spotifyApi.setAccessToken(data.body["access_token"]);
        },
        function (err) {
          console.log("Something went wrong!", err);
        }
      );
    }
    /*


    spotifyApi.getArtistAlbums("43ZHCT0cAZBISjO8DG9PnE").then(
      function (data) {
        console.log("Artist albums", data.body);
      },
      function (err) {
        console.error(err);
      }
    );*/
  }
}
