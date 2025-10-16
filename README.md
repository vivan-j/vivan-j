## Spotify Now Playing – Setup

This project can show a subtle "Now Playing" pill using your Spotify account. To enable it:

1. Create a copy of `.env.example` named `.env` and fill in:

```
SPOTIFY_CLIENT_ID=your_client_id
SPOTIFY_CLIENT_SECRET=your_client_secret
SPOTIFY_REFRESH_TOKEN=your_refresh_token
```

2. Create a Spotify app at https://developer.spotify.com/dashboard and add a redirect URI, e.g. `http://localhost:5173/callback`.

3. Get a refresh token (one-time):
	- Go to: `https://accounts.spotify.com/authorize?response_type=code&client_id=YOUR_CLIENT_ID&scope=user-read-currently-playing%20user-read-recently-played&redirect_uri=YOUR_REDIRECT_URI`
	- After authorizing, you'll be redirected to YOUR_REDIRECT_URI with `?code=...`.
	- Exchange that code for tokens using a simple script or a tool like curl/Postman:

```
POST https://accounts.spotify.com/api/token
Content-Type: application/x-www-form-urlencoded
Authorization: Basic base64(YOUR_CLIENT_ID:YOUR_CLIENT_SECRET)

grant_type=authorization_code&code=THE_CODE&redirect_uri=YOUR_REDIRECT_URI
```

The response includes `refresh_token`. Put it in your `.env`.

Scopes required: `user-read-currently-playing user-read-recently-played`.

4. Run the app. The pill will appear automatically when credentials are valid. No secrets are exposed to the browser; the endpoint runs server-side only.

# hola