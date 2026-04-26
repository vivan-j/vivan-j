import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { REDIS_URL } from '$env/static/private';

// Cloudflare Workers don't support raw TCP sockets, so the 'redis' npm package won't work.
// This implementation gracefully returns null for the view count.
// To restore view counting on Cloudflare, consider:
// 1. Using Upstash Redis (HTTP-based): https://upstash.com
// 2. Using Cloudflare KV or D1 for simple counters

export const GET: RequestHandler = async () => {
  try {
    if (!REDIS_URL) {
      console.log('redis not set up');
      return json({ views: null });
    }

    // TCP-based Redis is not supported on Cloudflare Workers.
    // Return null until migrated to an HTTP-based solution.
    console.log('redis view counter disabled on cloudflare workers (tcp not supported)');
    return json({ views: null });
  } catch (error) {
    console.error('analytics error:', error);
    return json({ views: null });
  }
};