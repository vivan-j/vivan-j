import { json } from '@sveltejs/kit';

const CHESS_USERNAME = 'chesschampv1';
const CACHE_DURATION = 3600; // 1 hour in seconds
let cachedStats: any = null;
let lastFetch = 0;

export async function GET() {
	const now = Date.now() / 1000;

	// return cached stats if still fresh
	if (cachedStats && now - lastFetch < CACHE_DURATION) {
		return json(cachedStats);
	}

	try {
		// fetch stats from chess.com api
		const response = await fetch(`https://api.chess.com/pub/player/${CHESS_USERNAME}/stats`, {
			headers: {
				'User-Agent': 'vivan-portfolio (https://vivanj.dev)'
			}
		});

		if (!response.ok) {
			throw new Error(`Chess.com API error: ${response.status}`);
		}

		const data = await response.json();

		// extract rapid rating
		const stats = {
			rapid: data.chess_rapid?.last?.rating || null
		};

		// cache the results
		cachedStats = stats;
		lastFetch = now;

		return json(stats);
	} catch (error) {
		console.error('failed to fetch chess.com stats:', error);
		return json({ error: 'failed to fetch chess stats' }, { status: 500 });
	}
}
