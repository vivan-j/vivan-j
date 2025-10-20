import { json } from '@sveltejs/kit';
import { createClient } from 'redis';
import type { RequestHandler } from './$types';
import { REDIS_URL } from '$env/static/private';

let redis: ReturnType<typeof createClient> | null = null;

async function getRedisClient() {
  if (!redis) {
    redis = createClient({ url: REDIS_URL });
    await redis.connect();
  }
  return redis;
}

export const GET: RequestHandler = async () => {
  try {
    // check if redis url is configured
    if (!REDIS_URL) {
      console.log('redis url not configured, using fallback');
      return json({ views: null });
    }

    const client = await getRedisClient();
    
    // increment view count atomically
    const viewCount = await client.incr('viewCount');
    return json({ views: viewCount });
  } catch (error) {
    console.error('redis error:', error);
    // fallback if redis fails
    return json({ views: null });
  }
};