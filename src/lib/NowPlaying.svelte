<script lang="ts">
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';

  let data: { playing: boolean; title?: string; artist?: string; url?: string; artwork?: string | null } | null = null;
  let visible = false;

  async function load() {
    try {
      const res = await fetch('/api/spotify/now-playing');
      if (!res.ok) return;
      data = await res.json();
      visible = !!(data && (data.title || data.artist));
    } catch {}
  }

  onMount(() => {
    if (!browser) return;
    load();
    const id = setInterval(load, 60_000);
    return () => clearInterval(id);
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
