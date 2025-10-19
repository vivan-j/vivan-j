import type { RequestHandler } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

const CLIENT_ID = env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = env.SPOTIFY_CLIENT_SECRET;
const REFRESH_TOKEN = env.SPOTIFY_REFRESH_TOKEN;

const basic = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');

async function getAccessToken() {
  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${basic}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: REFRESH_TOKEN ?? ''
    })
  });

  if (!res.ok) throw new Error('failed to refresh token');
  const data = await res.json();
  return data.access_token as string;
}

async function fetchNowPlaying(access_token: string) {
  const res = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
    headers: { Authorization: `Bearer ${access_token}` }
  });
  if (res.status === 204 || res.status === 202) return null; // nothing playing
  if (!res.ok) throw new Error('failed to fetch now playing');
  return res.json();
}

async function fetchRecent(access_token: string) {
  const res = await fetch('https://api.spotify.com/v1/me/player/recently-played?limit=1', {
    headers: { Authorization: `Bearer ${access_token}` }
  });
  if (!res.ok) throw new Error('failed to fetch recently played');
  return res.json();
}

export const GET: RequestHandler = async () => {
  try {
    if (!CLIENT_ID || !CLIENT_SECRET || !REFRESH_TOKEN) {
      return new Response(JSON.stringify({ playing: false }), { status: 200 });
    }

    const token = await getAccessToken();
    const now = await fetchNowPlaying(token);

    if (now && now.item) {
      const item = now.item;
      const progressMs = typeof now.progress_ms === 'number' ? now.progress_ms : null;
      const durationMs = typeof item.duration_ms === 'number' ? item.duration_ms : null;
      return new Response(JSON.stringify({
        playing: now.is_playing ?? false,
        title: item.name,
        artist: item.artists?.map((a: any) => a.name).join(', '),
        url: item.external_urls?.spotify,
        artwork: item.album?.images?.[1]?.url || item.album?.images?.[0]?.url || null,
        progressMs,
        durationMs,
        serverTime: Date.now()
      }), { headers: {
        'Content-Type': 'application/json',
        // prevent CDN/browser caching
        'Cache-Control': 'private, no-cache, no-store, max-age=0, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'CDN-Cache-Control': 'no-store'
      } });
    }

    const recent = await fetchRecent(token);
    const last = recent.items?.[0]?.track;
    if (last) {
      return new Response(JSON.stringify({
        playing: false,
        title: last.name,
        artist: last.artists?.map((a: any) => a.name).join(', '),
        url: last.external_urls?.spotify,
        artwork: last.album?.images?.[1]?.url || last.album?.images?.[0]?.url || null,
        progressMs: null,
        durationMs: typeof last.duration_ms === 'number' ? last.duration_ms : null,
        serverTime: Date.now()
      }), { headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'private, no-cache, no-store, max-age=0, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'CDN-Cache-Control': 'no-store'
      } });
    }

    return new Response(JSON.stringify({ playing: false }), { status: 200, headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'private, no-cache, no-store, max-age=0, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      'CDN-Cache-Control': 'no-store'
    } });
  } catch (e) {
    return new Response(JSON.stringify({ playing: false }), { status: 200, headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'private, no-cache, no-store, max-age=0, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      'CDN-Cache-Control': 'no-store'
    } });
  }
};

// Ensure Node runtime on Vercel (not Edge), avoids missing Buffer and subtle caching behavior
// Ensure a supported Node runtime on Vercel (not Edge) to allow Buffer and other Node APIs.
// Vercel official runtimes: nodejs20.x is current (nodejs18.x may be deprecated).
export const config = { runtime: 'nodejs20.x' } as const;
