<script lang="ts">
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';

  export let text = '';
  export let tag = 'p';
  export let className = '';

  let element: HTMLElement;

  onMount(async () => {
    if (!element || !text || !browser) return;

    const { gsap } = await import('gsap');

    // Split text into characters
    const chars = text.split('').map((char, i) => 
      char === ' ' ? '&nbsp;' : `<span style="display: inline-block; opacity: 0; transform: translateY(40px);">${char}</span>`
    ).join('');
    
    element.innerHTML = chars;
    
    // Animate characters
    const charElements = element.querySelectorAll('span');
    gsap.to(charElements, {
      opacity: 1,
      y: 0,
      duration: 0.6,
      ease: 'power3.out',
      stagger: 0.05
    });
  });
</script>

<svelte:element 
  this={tag} 
  bind:this={element} 
  class={className}
  style="overflow: hidden; display: block; width: 100%;"
>
  {text}
</svelte:element>