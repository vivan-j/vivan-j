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
  let animationFrame: number | null = null;
  let currentProgressMs = 0;

  function formatTime(ms: number): string {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  function updateProgress() {
    if (data?.playing && typeof data.progressMs === 'number' && typeof data.serverTime === 'number') {
      // Estimate current progress based on time elapsed since server response
      const elapsed = Date.now() - data.serverTime;
      currentProgressMs = data.progressMs + elapsed;
    }
    
    if (data?.playing) {
      animationFrame = requestAnimationFrame(updateProgress);
    }
  }

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
        currentProgressMs = data?.progressMs ?? 0;
        
        // Start animation frame for real-time progress
        if (data?.playing) {
          if (animationFrame) cancelAnimationFrame(animationFrame);
          updateProgress();
        }
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
      if (animationFrame) cancelAnimationFrame(animationFrame);
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
    {#if variant === 'pill' && data.playing && typeof data.durationMs === 'number' && data.durationMs > 0}
      <span class="progress-bar" aria-hidden="true" style="--progress: {(currentProgressMs / data.durationMs) * 100}%"></span>
    {/if}
  </a>
{:else if loading}
  <div class="now-playing skeleton" aria-hidden="true">
    <span class="dot"></span>
    <span class="label">listening...</span>
  </div>
{/if}

<style>
  /* Base pill styles */
  .now-playing {
    position: fixed;
    bottom: calc(16px + env(safe-area-inset-bottom));
    right: calc(16px + env(safe-area-inset-right));
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    border: 1px solid rgba(96, 165, 250, 0.2);
    border-radius: 10px;
    background: rgba(10, 10, 15, 0.85);
    backdrop-filter: blur(12px);
    color: var(--text-secondary);
    text-decoration: none;
    font-size: 0.875rem;
    opacity: 0.8;
    transition: all 0.2s ease;
    z-index: 50;
    max-width: min(90vw, 380px);
    overflow: hidden;
    animation: npAppear 0.3s ease-out;
  }

  /* Hover & focus states */
  .now-playing:hover {
    opacity: 1;
    border-color: rgba(96, 165, 250, 0.4);
    box-shadow: none;
    transform: translateY(-2px);
  }

  .now-playing:focus-visible {
    outline: 2px solid rgba(96, 165, 250, 0.6);
    outline-offset: 2px;
  }

  /* Playing state */
  .now-playing.playing {
    border-color: rgba(96, 165, 250, 0.35);
    box-shadow: none;
  }

  /* Album art */
  .now-playing .art {
    width: 20px;
    height: 20px;
    border-radius: 4px;
    object-fit: cover;
    flex-shrink: 0;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: #0b0b12;
  }

  /* Pulsing dot (fallback) */
  .now-playing .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--accent-color);
    flex-shrink: 0;
    animation: pulse 1.6s ease-in-out infinite;
  }

  /* Content container */
  .now-playing .content {
    display: inline-flex;
    gap: 6px;
    align-items: baseline;
    min-width: 0;
    flex: 1;
    animation: npSwap 0.2s ease-out;
  }

  /* Track & artist text */
  .now-playing .track {
    color: var(--text-color);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    min-width: 0;
  }

  .now-playing .sep {
    opacity: 0.6;
    flex-shrink: 0;
  }

  .now-playing .artist {
    opacity: 0.85;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    min-width: 0;
  }

  /* Progress bar - subtle at bottom */
  .now-playing .progress-bar {
    position: absolute;
    bottom: 0;
    left: 0;
    height: 2px;
    width: var(--progress, 0%);
    background: linear-gradient(90deg, var(--accent-color), rgba(96, 165, 250, 0.6));
    border-radius: 0 0 10px 0;
    transition: width 0.1s linear;
    opacity: 0.8;
  }
  .now-playing .viz {
    position: absolute;
    inset: -14px;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.2s ease;
  }

  .now-playing.playing .viz {
    opacity: 1;
  }

  .now-playing .viz span {
    position: absolute;
    width: 3px;
    background: linear-gradient(to top, var(--accent-color), rgba(96, 165, 250, 0.2));
    border-radius: 2px;
    animation: eqRadial 1.4s ease-in-out infinite;
    box-shadow: 0 0 8px rgba(96, 165, 250, 0.6);
  }

  /* Position 8 bars around the pill - every 45 degrees */
  /* Top */
  .now-playing .viz span:nth-child(1) {
    top: -14px;
    left: 50%;
    height: 14px;
    transform: translateX(-50%);
    animation-delay: 0s;
  }

  /* Top-right */
  .now-playing .viz span:nth-child(2) {
    top: -8px;
    right: -8px;
    height: 14px;
    transform: rotate(45deg);
    animation-delay: 0.08s;
  }

  /* Right */
  .now-playing .viz span:nth-child(3) {
    right: -14px;
    top: 50%;
    height: 14px;
    transform: translateY(-50%);
    animation-delay: 0.16s;
  }

  /* Bottom-right */
  .now-playing .viz span:nth-child(4) {
    bottom: -8px;
    right: -8px;
    height: 14px;
    transform: rotate(45deg);
    animation-delay: 0.24s;
  }

  /* Bottom */
  .now-playing .viz span:nth-child(5) {
    bottom: -14px;
    left: 50%;
    height: 14px;
    transform: translateX(-50%);
    animation-delay: 0.32s;
  }

  /* Bottom-left */
  .now-playing .viz span:nth-child(6) {
    bottom: -8px;
    left: -8px;
    height: 14px;
    transform: rotate(45deg);
    animation-delay: 0.4s;
  }

  /* Left */
  .now-playing .viz span:nth-child(7) {
    left: -14px;
    top: 50%;
    height: 14px;
    transform: translateY(-50%);
    animation-delay: 0.48s;
  }

  /* Top-left */
  .now-playing .viz span:nth-child(8) {
    top: -8px;
    left: -8px;
    height: 14px;
    transform: rotate(45deg);
    animation-delay: 0.56s;
  }

  /* Shimmer effect when playing */
  .now-playing::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 8px;
    right: 8px;
    height: 1px;
    background: linear-gradient(
      90deg,
      rgba(96, 165, 250, 0) 0%,
      rgba(96, 165, 250, 0.8) 50%,
      rgba(96, 165, 250, 0) 100%
    );
    background-size: 200% 100%;
    opacity: 0;
    transition: opacity 0.2s ease;
  }

  .now-playing.playing::after {
    opacity: 0.3;
    animation: npShimmer 2.5s ease-in-out infinite;
  }

  /* Inline variant */
  .now-inline {
    position: static;
    display: inline-flex;
    align-items: baseline;
    gap: 6px;
    padding: 0;
    border: 0;
    background: transparent;
    backdrop-filter: none;
    color: var(--text-secondary);
    text-decoration: none;
    opacity: 0.9;
    max-width: 100%;
    margin-top: 0.35rem;
  }

  .now-inline:hover {
    color: var(--accent-color);
    opacity: 1;
  }

  .now-inline .label {
    font-size: 0.9em;
    opacity: 0.8;
  }

  .now-inline .track {
    color: var(--text-color);
  }

  .now-inline .sep {
    opacity: 0.5;
  }

  .now-inline .artist {
    opacity: 0.85;
  }

  .now-inline .dot {
    align-self: center;
  }

  /* Skeleton loading state */
  .skeleton {
    opacity: 0.4;
    pointer-events: none;
  }

  /* Animations */
  @keyframes npAppear {
    from {
      opacity: 0;
      transform: translateY(8px);
    }
    to {
      opacity: 0.8;
      transform: translateY(0);
    }
  }

  @keyframes npSwap {
    from {
      opacity: 0;
      transform: translateY(3px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes pulse {
    0%, 100% {
      box-shadow: 0 0 0 0 rgba(96, 165, 250, 0.5);
    }
    50% {
      box-shadow: 0 0 0 6px rgba(96, 165, 250, 0);
    }
  }

  @keyframes eq {
    0%, 100% {
      transform: scaleY(0.4);
    }
    40% {
      transform: scaleY(1);
    }
    70% {
      transform: scaleY(0.6);
    }
  }

  @keyframes eqRadial {
    0%, 100% {
      opacity: 0.4;
      height: 6px;
    }
    50% {
      opacity: 1;
      height: 24px;
    }
  }

  @keyframes npShimmer {
    0% {
      background-position: 200% 0;
    }
    100% {
      background-position: -200% 0;
    }
  }
  @media (max-width: 640px) {
    .now-playing {
      padding: 7px 10px;
      gap: 7px;
      font-size: 0.8125rem;
      max-width: min(92vw, 340px);
      bottom: calc(12px + env(safe-area-inset-bottom));
      right: calc(12px + env(safe-area-inset-right));
    }

    .now-playing .art {
      width: 18px;
      height: 18px;
    }
  }

  @media (max-width: 420px) {
    .now-playing {
      padding: 6px 9px;
      gap: 6px;
      max-width: min(94vw, 300px);
    }

    .now-playing .artist {
      max-width: 120px;
    }
  }

  @media (max-width: 360px) {
    .now-playing .sep,
    .now-playing .artist {
      display: none;
    }

    .now-inline .sep,
    .now-inline .artist {
      display: none;
    }
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .now-playing,
    .now-playing .content,
    .now-playing .dot,
    .now-playing .viz span,
    .now-playing::after {
      animation: none;
      transition: none;
    }
  }
</style>
