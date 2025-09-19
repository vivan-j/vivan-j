<script lang="ts">
  import { onMount } from 'svelte';
  import { gsap } from 'gsap';
  import { ScrollTrigger } from 'gsap/ScrollTrigger';
  import SplitText from '$lib/SplitText.svelte';
  import Squares from '$lib/Squares.svelte';

  gsap.registerPlugin(ScrollTrigger);

  let mainContent: HTMLElement;

  onMount(() => {
    // Make content visible and animate on scroll
    gsap.set(mainContent, { opacity: 1 });
    gsap.set(mainContent.children, { opacity: 0, y: 50 });
    
    gsap.to(mainContent.children, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      stagger: 0.2,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: mainContent,
        start: 'top 90%',
        once: true
      }
    });
  });
</script>

<!-- Hero Section - Full Viewport -->
<section class="hero-section">
  <Squares direction="diagonal" speed={0.5} borderColor="#30363d" />
  
  <div class="hero-content">
    <SplitText text="Vivan Jaiswal" tag="h1" className="hero-title" />
    <SplitText text="Aspiring Web Developer" tag="p" className="hero-subtitle" />
  </div>
  
  <!-- Scroll Arrow -->
  <div class="scroll-arrow">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M7 10L12 15L17 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  </div>
</section>

<!-- Main Content - Hidden initially, revealed on scroll -->
<div class="container" bind:this={mainContent}>
  <main>
    <section id="about">
      <h2>About Me</h2>
      <p>I'm a high school student who's passionate about technology and coding. I'm currently learning web development and excited to build cool things for everyone.</p>
    </section>

    <section id="projects">
      <h2>My Projects</h2>
      <div class="project-grid">
        <div class="project-card">
          <h3>
        <a href="https://discord.com/oauth2/authorize?client_id=1399219689548288060" target="_blank" rel="noopener noreferrer">
          abcBot
        </a>
          </h3>
          <p>abcBot is a discord bot made in Python which lets you talk to AI models, some of which are fine-tuned for specific tasks.</p>
        </div>
        <div class="project-card">
          <h3>
        <a href="https://math.vivanj.dev" target="_blank" rel="noopener noreferrer">
          math.vivanj.dev
        </a>
          </h3>
          <p>This is a website built over a fork and made in React that allows you to play hundreds of web-based games on one platform.</p>
        </div>
      </div>
    </section>

    <section id="contact">
      <h2>Contact Me</h2>
      <p>You can contact me at <a href="mailto:vivan.jaiswal924@gmail.com">vivan.jaiswal924@gmail.com</a>.</p>
    </section>
  </main>

  <footer>
    <!-- svelte-ignore a11y_invalid_attribute -->
    <p>I'm on <a href="https://github.com/vivan-j">GitHub</a>.</p>
  </footer>
</div>

<style>
  .hero-section {
    height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    position: relative;
    overflow: hidden;
  }

  .scroll-arrow {
    position: absolute;
    bottom: 2rem;
    color: #8b949e;
    animation: bounce 2s infinite;
    cursor: pointer;
    z-index: 3;
    pointer-events: auto;
  }

  @keyframes bounce {
    0%, 20%, 50%, 80%, 100% {
      transform: translateY(0);
    }
    40% {
      transform: translateY(-10px);
    }
    60% {
      transform: translateY(-5px);
    }
  }

  .hero-content {
    max-width: 90%;
    width: 100%;
    padding: 0 1rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    position: relative;
    z-index: 2;
    pointer-events: none;
  }

  :global(.hero-title) {
    font-size: clamp(2rem, 8vw, 4rem);
    font-weight: 600;
    color: var(--text-color);
    margin: 0;
    line-height: 1.1;
    display: block;
    width: 100%;
    text-align: center;
  }

  :global(.hero-subtitle) {
    font-size: clamp(1rem, 4vw, 1.5rem);
    color: #8b949e;
    margin: 0;
    display: block;
    width: 100%;
    text-align: center;
  }

  @media (max-width: 480px) {
    .hero-content {
      padding: 0 0.5rem;
      gap: 0.5rem;
    }
    
    :global(.hero-title) {
      line-height: 1.2;
    }
  }
</style>
