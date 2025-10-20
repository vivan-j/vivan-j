<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/v1.png';
	import NowPlaying from '$lib/NowPlaying.svelte';
	import { inject } from '@vercel/analytics';
	import { dev } from '$app/environment';

	let { children } = $props();

	// inject analytics in production
	if (!dev) {
		inject();
	}
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500&display=swap" rel="stylesheet" />
</svelte:head>

{@render children?.()}
<NowPlaying />
