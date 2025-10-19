<script lang="ts">
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';

  export let variant: 'pill' | 'inline' = 'pill';

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
  let loading = true;
  let timer: number | null = null;

  function scheduleNextPoll() {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    
    let nextIn = 15_000; // default: 15s for better responsiveness
    
    if (data?.playing && typeof data.progressMs === 'number' && typeof data.durationMs === 'number') {
      const remaining = Math.max(0, data.durationMs - data.progressMs);
      const jitter = 200 + Math.random() * 400; // small jitter
      
      if (remaining < 10_000) {
        // song ending soon, poll very frequently
        nextIn = Math.max(1_500, remaining + jitter);
      } else if (remaining < 30_000) {
        // song ending in 30s, poll every 3s
        nextIn = 3_000 + jitter;
      } else {
        // actively playing - poll every 8s to catch manual skips
        nextIn = 8_000 + jitter;
      }
    } else if (!data?.playing) {
      // not playing, check frequently for new songs
      nextIn = 10_000;
    }
    
    timer = setTimeout(load, nextIn) as unknown as number;
  }

  async function load() {
    try {
      // Add cache-busting param and explicit no-store to avoid stale CDN/browser responses
      const url = `/api/spotify/now-playing?t=${Date.now()}`;
      const res = await fetch(url, { cache: 'no-store', headers: { 'pragma': 'no-cache', 'cache-control': 'no-cache' } });
      if (res.ok) {
        data = await res.json();
        visible = !!(data && (data.title || data.artist));
      }
    } catch (err) {
      // optional: console.warn('NowPlaying fetch failed', err);
    } finally {
      loading = false;
      scheduleNextPoll();
    }
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
  <a
    class:now-playing={variant === 'pill'}
    class:now-inline={variant === 'inline'}
    class:playing={data.playing}
    href={data.url}
    target="_blank"
    rel="noopener noreferrer"
    aria-label="Now playing on Spotify"
    title={`${data.title ?? ''}${data.artist ? ' — ' + data.artist : ''}`.trim()}
    aria-live="polite"
    aria-atomic="true"
  >
    {#if data.artwork}
      <img class="art" src={data.artwork} alt="" loading="lazy" decoding="async" />
    {:else}
      <span class:dot={data.playing}></span>
    {/if}
    {#if variant === 'pill'}
      <span class="viz" aria-hidden="true">
        <span></span>
        <span></span>
        <span></span>
        <span></span>
      </span>
    {/if}
    {#if variant === 'inline'}
      <span class="label">listening to</span>
    {/if}
    {#key data?.title}
      <span class="content">
        {#if data.title}
          <span class="track">{data.title}</span>
        {/if}
        {#if data.artist}
          <span class="sep">—</span>
          <span class="artist">{data.artist}</span>
        {/if}
      </span>
    {/key}
  </a>
{:else if loading}
  <div class="now-playing skeleton" aria-hidden="true">
    <span class="dot"></span>
    <span class="label">listening...</span>
  </div>
{/if}

<style>
  .now-playing {
    position: fixed;
    bottom: calc(14px + env(safe-area-inset-bottom));
    /* always hug the viewport edge to avoid odd placements */
    right: calc(14px + env(safe-area-inset-right));
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 6px 10px;
    border: 1px solid rgba(96,165,250,0.16);
    border-radius: 8px;
    background: rgba(10,10,15,0.42);
    color: var(--text-secondary);
    text-decoration: none;
    border-bottom: none !important;
  opacity: 0.75;
  transition: opacity .2s ease, border-color .2s ease, transform .2s ease, box-shadow .2s ease;
  z-index: 50;
  backdrop-filter: blur(6px);
    max-width: min(92vw, 420px);
    /* ensure text can shrink and ellipsize */
    overflow: hidden;
    animation: npAppear .25s ease-out;
  }
  /* keyboard focus ring */
  .now-playing:focus-visible { outline: 2px solid rgba(96,165,250,0.6); outline-offset: 2px; }
  .now-playing:focus { text-decoration: none; }
    /* subtle equalizer viz below the pill */
    .now-playing { position: fixed; }
    .now-playing .viz {
      position: absolute;
      left: 10px;
      right: 10px;
      bottom: -8px;
      height: 12px;
      display: flex;
      justify-content: center;
      gap: 4px;
      opacity: 0;
      pointer-events: none;
      filter: blur(0.3px);
      transition: opacity .2s ease;
    }
    .now-playing .viz span {
      width: 2px;
      height: 100%;
      background: var(--accent-color);
      opacity: 0.5;
      border-radius: 2px;
      transform-origin: bottom;
      animation: eq 1.4s ease-in-out infinite;
    }
    .now-playing .viz span:nth-child(2) { animation-delay: .12s }
    .now-playing .viz span:nth-child(3) { animation-delay: .24s }
    .now-playing .viz span:nth-child(4) { animation-delay: .36s }
    .now-playing.playing .viz { opacity: .45; }
    @keyframes eq {
      0% { transform: scaleY(.4); }
      40% { transform: scaleY(1); }
      70% { transform: scaleY(.6); }
      100% { transform: scaleY(.4); }
    }
    @media (prefers-reduced-motion: reduce) {
      .now-playing .viz span { animation: none; }
    }
  @keyframes npAppear { from { opacity: 0; transform: translateY(6px); } to { opacity: 0.5; transform: translateY(0); } }
    .now-playing:hover { opacity: 1; border-color: rgba(96,165,250,0.35); box-shadow: 0 8px 24px rgba(0,0,0,0.25); }
    .now-playing.playing { border-color: rgba(96,165,250,0.4); box-shadow: 0 6px 20px rgba(96,165,250,0.1); padding-bottom: 14px; }
  .now-playing .track { color: var(--text-color); }
  .now-playing .sep { opacity: .6 }
  .now-playing .artist { opacity: .9 }
  /* truncate long text nicely */
  .now-playing .track,
  .now-playing .artist {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 48%;
  }
  .now-playing {
    position: fixed; /* establishes containing block for ::after */
    animation: npAppear .25s ease-out;
  }
  .now-playing::after {
    content: '';
    position: absolute;
    left: 8px;
    right: 8px;
    border-radius: 2px;
    opacity: 0;
    background: linear-gradient(90deg, rgba(96,165,250,0) 0%, rgba(96,165,250,0.8) 50%, rgba(96,165,250,0) 100%);
    background-size: 200% 100%;
    transform: scaleX(0.85);
    transform-origin: center;
    transition: opacity .2s ease, transform .2s ease;
  }
  .now-playing.playing::after {
    opacity: 0.25;
    animation: npShimmer 2.2s ease-in-out infinite;
    transform: scaleX(1);
  }
  @keyframes npShimmer { 0% { background-position: 200% 0; } 50% { background-position: 0% 0; } 100% { background-position: -200% 0; } }
  .now-playing .sep { flex: 0 0 auto; }
  .now-playing .dot { flex: 0 0 auto; }
  .now-playing .dot {
    width: 6px; height: 6px; border-radius: 50%; background: var(--accent-color);
    box-shadow: 0 0 0 0 rgba(96,165,250,0.45);
    animation: pulse 1.6s infinite;
  }
  .now-playing .art {
    width: 18px; height: 18px; border-radius: 4px; object-fit: cover; flex: 0 0 auto;
    box-shadow: 0 2px 8px rgba(0,0,0,0.25);
    border: 1px solid rgba(255,255,255,0.08);
    background: #0b0b12;
  }
  @keyframes pulse {
    0% { box-shadow: 0 0 0 0 rgba(96,165,250,0.45); }
    70% { box-shadow: 0 0 0 5px rgba(96,165,250,0); }
    100% { box-shadow: 0 0 0 0 rgba(96,165,250,0); }
  }
  /* inline variant - seamless header integration */
  .now-inline {
    position: static;
    display: inline-flex;
    align-items: baseline;
    gap: 6px;
    padding: 0;
    border: 0;
    background: transparent;
    color: var(--text-secondary);
    text-decoration: none;
    opacity: 0.9;
    max-width: 100%;
    margin-top: 0.35rem;
  }
  .now-inline:hover { color: var(--accent-color); opacity: 1; }
  .now-inline .label { font-size: 0.9em; opacity: 0.8; }
  .now-inline .track { color: var(--text-color); }
  .now-inline .sep { opacity: .5 }
  .now-inline .artist { opacity: .85 }
  .now-inline .track,
  .now-inline .artist { max-width: none; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .now-inline .dot { align-self: center; }
  .skeleton { opacity: 0.4; pointer-events: none; }
  .now-playing .content { display: inline-flex; gap: 6px; align-items: baseline; animation: npSwap .2s ease-out; }
  @keyframes npSwap { from { opacity: 0; transform: translateY(2px); } to { opacity: 1; transform: translateY(0); } }
  /* reduce motion preferences */
  @media (prefers-reduced-motion: reduce) {
    .now-playing { animation: none; transition: none; }
    .now-playing .dot { animation: none; }
  }
  @media (max-width: 480px) {
    .now-playing { padding: 5px 8px; gap: 6px; max-width: min(94vw, 360px); }
    .now-playing .track, .now-playing .artist { max-width: 44%; }
    .now-inline { display: flex; gap: 6px; }
  }
  @media (max-width: 400px) { .now-playing .art { display: none; } }
  /* no special right alignment needed now that we always use viewport edge */
  /* collapse artist on very small screens to keep pill tidy */
  @media (max-width: 360px) {
    .now-playing .sep, .now-playing .artist { display: none; }
    .now-playing .track { max-width: 100%; }
    .now-inline .sep, .now-inline .artist { display: none; }
    .now-inline .track { max-width: 100%; }
  }
</style>
