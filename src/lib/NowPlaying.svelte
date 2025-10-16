<script lang="ts">
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';

  type NowData = {
    playing: boolean;
    title?: string;
    artist?: string;
    url?: string;
    artwork?: string | null;
    progressMs?: number | null;
    durationMs?: number | null;
    serverTime?: number;
  };

  let data: NowData | null = null;
  let visible = false;
  let timer: number | null = null;

  function scheduleNextPoll() {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    // Default: 60s
    let nextIn = 60_000;
    if (data?.playing && typeof data.progressMs === 'number' && typeof data.durationMs === 'number') {
      const remaining = Math.max(0, data.durationMs - data.progressMs);
      // Add a small jitter (200-600ms) to avoid syncing across clients
      const jitter = 200 + Math.random() * 400;
      // Cap between 1.5s and 90s
      nextIn = Math.min(90_000, Math.max(1_500, remaining + jitter));
    }
    timer = setTimeout(load, nextIn) as unknown as number;
  }

  async function load() {
    try {
      // Add cache-busting param and explicit no-store to avoid stale CDN/browser responses
      const url = `/api/spotify/now-playing?t=${Date.now()}`;
      const res = await fetch(url, { cache: 'no-store', headers: { 'pragma': 'no-cache', 'cache-control': 'no-cache' } });
      if (!res.ok) return;
      data = await res.json();
      visible = !!(data && (data.title || data.artist));
      scheduleNextPoll();
    } catch {}
  }

  onMount(() => {
    if (!browser) return;
    load();
    return () => {
      if (timer) clearTimeout(timer);
    };
  });
</script>

{#if visible && data}
  <a class="now-playing" href={data.url} target="_blank" rel="noopener noreferrer" aria-label="Now playing on Spotify">
    <span class:dot={data.playing}></span>
    {#if data.title}
      <span class="track">{data.title}</span>
    {/if}
    {#if data.artist}
      <span class="sep">—</span>
      <span class="artist">{data.artist}</span>
    {/if}
  </a>
{/if}

<style>
  .now-playing {
    position: fixed;
    bottom: 18px;
    right: 18px;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 6px 10px;
    border: 1px solid rgba(96,165,250,0.15);
    border-radius: 8px;
    background: rgba(10,10,15,0.4);
    color: var(--text-secondary);
    text-decoration: none;
    opacity: 0.6;
    transition: opacity .2s ease, border-color .2s ease;
    z-index: 2;
    backdrop-filter: blur(6px);
  }
  .now-playing:hover { opacity: 1; border-color: rgba(96,165,250,0.35); }
  .now-playing .track { color: var(--text-color); }
  .now-playing .sep { opacity: .6 }
  .now-playing .artist { opacity: .9 }
  .now-playing .dot {
    width: 6px; height: 6px; border-radius: 50%; background: #22c55e;
    box-shadow: 0 0 0 0 rgba(34,197,94,0.6);
    animation: pulse 1.6s infinite;
  }
  @keyframes pulse {
    0% { box-shadow: 0 0 0 0 rgba(34,197,94,0.6); }
    70% { box-shadow: 0 0 0 6px rgba(34,197,94,0); }
    100% { box-shadow: 0 0 0 0 rgba(34,197,94,0); }
  }
  @media (max-width: 480px) {
    .now-playing { bottom: 12px; right: 12px; padding: 5px 8px; gap: 6px; }
  }
</style>
