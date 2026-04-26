import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// Cloudflare Workers don't support raw TCP sockets, so the 'redis' npm package won't work.
// To restore view counting on Cloudflare, consider:
// 1. Using Upstash Redis (HTTP-based): https://upstash.com
// 2. Using Cloudflare KV or D1 for simple counters

export const GET: RequestHandler = async () => {
  return json({ views: null });
};