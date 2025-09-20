<script lang="ts">
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';

  export let direction: 'diagonal' | 'up' | 'right' | 'down' | 'left' = 'right';
  export let speed = 1;
  export let borderColor = '#333';
  export let squareSize = 40;
  export let hoverFillColor = '#444';

  let canvas: HTMLCanvasElement;
  let animationId: number;
  let running = true;
  let lastFrame = 0;
  let rafInterval = 1000 / 60; // 60fps target
  let numSquaresX = 0;
  let numSquaresY = 0;
  let gridOffset = { x: 0, y: 0 };
  let hoveredSquare: { x: number; y: number } | null = null;

  onMount(() => {
    if (!browser || !canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let resizeRaf: number | null = null;
    const resizeCanvas = () => {
      if (resizeRaf) cancelAnimationFrame(resizeRaf);
      // Debounce to next frame to avoid thrashing
      resizeRaf = requestAnimationFrame(() => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      numSquaresX = Math.ceil(canvas.width / squareSize) + 1;
      numSquaresY = Math.ceil(canvas.height / squareSize) + 1;
        resizeRaf = null;
      });
    };

    const drawGrid = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const startX = Math.floor(gridOffset.x / squareSize) * squareSize;
      const startY = Math.floor(gridOffset.y / squareSize) * squareSize;

      for (let x = startX; x < canvas.width + squareSize; x += squareSize) {
        for (let y = startY; y < canvas.height + squareSize; y += squareSize) {
          const squareX = x - (gridOffset.x % squareSize);
          const squareY = y - (gridOffset.y % squareSize);

          if (
            hoveredSquare &&
            Math.floor((x - startX) / squareSize) === hoveredSquare.x &&
            Math.floor((y - startY) / squareSize) === hoveredSquare.y
          ) {
            ctx.fillStyle = hoverFillColor;
            ctx.fillRect(squareX, squareY, squareSize, squareSize);
          }

          ctx.strokeStyle = borderColor;
          ctx.strokeRect(squareX, squareY, squareSize, squareSize);
        }
      }

      // Add gradient overlay
      const gradient = ctx.createRadialGradient(
        canvas.width / 2,
        canvas.height / 2,
        0,
        canvas.width / 2,
        canvas.height / 2,
        Math.sqrt(canvas.width ** 2 + canvas.height ** 2) / 2
      );
      gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
      gradient.addColorStop(1, 'rgba(13, 17, 23, 0.7)');

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    };

    const updateAnimation = (now = 0) => {
      if (!running) {
        animationId = requestAnimationFrame(updateAnimation);
        return;
      }
      // Simple frame limiter to ~60fps
      if (now - lastFrame < rafInterval) {
        animationId = requestAnimationFrame(updateAnimation);
        return;
      }
      lastFrame = now;

      const effectiveSpeed = Math.max(speed, 0.1);
      
      switch (direction) {
        case 'right':
          gridOffset.x = (gridOffset.x - effectiveSpeed + squareSize) % squareSize;
          break;
        case 'left':
          gridOffset.x = (gridOffset.x + effectiveSpeed + squareSize) % squareSize;
          break;
        case 'up':
          gridOffset.y = (gridOffset.y + effectiveSpeed + squareSize) % squareSize;
          break;
        case 'down':
          gridOffset.y = (gridOffset.y - effectiveSpeed + squareSize) % squareSize;
          break;
        case 'diagonal':
          gridOffset.x = (gridOffset.x - effectiveSpeed + squareSize) % squareSize;
          gridOffset.y = (gridOffset.y - effectiveSpeed + squareSize) % squareSize;
          break;
      }

      drawGrid();
      animationId = requestAnimationFrame(updateAnimation);
    };

    const handleMouseMove = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;

      const startX = Math.floor(gridOffset.x / squareSize) * squareSize;
      const startY = Math.floor(gridOffset.y / squareSize) * squareSize;

      const hoveredSquareX = Math.floor((mouseX + gridOffset.x - startX) / squareSize);
      const hoveredSquareY = Math.floor((mouseY + gridOffset.y - startY) / squareSize);

      if (
        !hoveredSquare ||
        hoveredSquare.x !== hoveredSquareX ||
        hoveredSquare.y !== hoveredSquareY
      ) {
        hoveredSquare = { x: hoveredSquareX, y: hoveredSquareY };
      }
    };

    const handleMouseLeave = () => {
      hoveredSquare = null;
    };

    window.addEventListener('resize', resizeCanvas);
    const handleVisibility = () => {
      running = document.visibilityState === 'visible';
    };
    document.addEventListener('visibilitychange', handleVisibility);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);
    
    resizeCanvas();
    animationId = requestAnimationFrame(updateAnimation);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      document.removeEventListener('visibilitychange', handleVisibility);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      if (animationId) cancelAnimationFrame(animationId);
    };
  });
</script>

<canvas bind:this={canvas} class="squares-canvas"></canvas>

<style>
  .squares-canvas {
    width: 100%;
    height: 100%;
    border: none;
    display: block;
    position: absolute;
    top: 0;
    left: 0;
    z-index: 0;
    opacity: 0.6;
    pointer-events: none;
  }
</style>