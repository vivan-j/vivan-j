import type { RequestHandler } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

const LASTFM_API_BASE = 'https://ws.audioscrobbler.com/2.0/';

const NO_CACHE_HEADERS = {
  'Content-Type': 'application/json',
  'Cache-Control': 'private, no-cache, no-store, max-age=0, must-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0',
  'CDN-Cache-Control': 'no-store'
};

export const GET: RequestHandler = async () => {
  try {
    const API_KEY = env.LASTFM_API_KEY;
    const USERNAME = env.LASTFM_USERNAME;

    if (!API_KEY || !USERNAME) {
      console.log('last.fm env vars missing');
      return new Response(JSON.stringify({ playing: false }), { status: 200 });
    }

    const url = `${LASTFM_API_BASE}?method=user.getrecenttracks&user=${USERNAME}&api_key=${API_KEY}&format=json&limit=1`;
    const res = await fetch(url);

    if (!res.ok) {
      throw new Error(`last.fm api error: ${res.status}`);
    }

    const data = await res.json();
    const tracks = data.recenttracks?.track;

    if (!tracks || tracks.length === 0) {
      return new Response(JSON.stringify({ playing: false }), { status: 200, headers: NO_CACHE_HEADERS });
    }

    const track = tracks[0];
    const isNowPlaying = track['@attr']?.nowplaying === 'true';
    const artwork = track.image?.find((img: any) => img.size === 'large')?.['#text'] 
                 || track.image?.find((img: any) => img.size === 'medium')?.['#text'] 
                 || null;

    return new Response(JSON.stringify({
      playing: isNowPlaying,
      title: track.name || null,
      artist: track.artist?.['#text'] || track.artist?.name || null,
      url: track.url || null,
      artwork: artwork || null,
      // last.fm doesn't provide progress/duration, set to null
      progressMs: null,
      durationMs: null,
      serverTime: Date.now()
    }), { headers: NO_CACHE_HEADERS });
  } catch (e) {
    console.error('last.fm now-playing error:', e);
    return new Response(JSON.stringify({ playing: false }), { status: 200, headers: NO_CACHE_HEADERS });
  }
};
