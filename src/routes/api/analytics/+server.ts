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
    // need redis to be configured first
    if (!REDIS_URL) {
      console.log('redis not set up');
      return json({ views: null });
    }

    const client = await getRedisClient();
    
    // add 1 to the total view count
    const viewCount = await client.incr('viewCount');
    return json({ views: viewCount });
  } catch (error) {
    console.error('redis error:', error);
    // just return null if something goes wrong
    return json({ views: null });
  }
};