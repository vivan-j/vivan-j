<script lang="ts">
  import PageInit from '$lib/PageInit.svelte';
  import { onMount } from 'svelte';

  const projects = [
    {
      name: 'ai.vivanj.dev',
      url: 'https://ai.vivanj.dev',
      description: 'A web platform that provides access to multiple AI models through a unified interface. Users can interact with different language models and compare their responses in real-time.'
    },
    {
      name: 'abcBot',
      url: '#',
      description: 'An intelligent Discord bot built with Python that integrates multiple AI models, including custom fine-tuned variants for specialized tasks. Features natural language processing and task-specific AI interactions.',
      status: 'In Development'
    }
  ];

  let currentProjectIndex = 0;
  $: currentProject = projects[currentProjectIndex];

  onMount(() => {
    if (projects.length > 1) {
      const interval = setInterval(() => {
        currentProjectIndex = (currentProjectIndex + 1) % projects.length;
      }, 5000);

      const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      };

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      }, observerOptions);

      document.querySelectorAll('section').forEach(el => {
        el.classList.add('fade-in-section');
        observer.observe(el);
      });

      return () => {
        clearInterval(interval);
        observer.disconnect();
      };
    }
  });
</script>

<PageInit />

<div class="container">
  <div class="content-wrapper">
    <header class="main-header">
      <h1>Vivan Jaiswal</h1>
      <p class="subtitle">Software Developer & Technology Enthusiast</p>
    </header>

    <section class="about-section">
      <h2>About</h2>
      <p>I'm a 15-year-old software developer from Sharon, MA working primarily with JavaScript, Java, and Python. I build web applications and contribute to competitive robotics on team #27369 DeepTech through <a href="https://www.firstinspires.org/robotics/ftc" target="_blank" rel="noopener noreferrer">FIRST Tech Challenge</a>.</p>
    </section>

    <section class="projects-section">
      <h2>Projects</h2>
      <div class="project-showcase">
        <div class="project-item">
          <h3>
            <a href={currentProject.url} target="_blank" rel="noopener noreferrer">
              {currentProject.name}
            </a>
          </h3>
          <p>{currentProject.description}</p>
          {#if currentProject.status}
            <span class="project-status">{currentProject.status}</span>
          {/if}
        </div>
        {#if projects.length > 1}
          <div class="project-dots">
            {#each projects as _, index}
              <button
                class="dot"
                class:active={index === currentProjectIndex}
                on:click={() => currentProjectIndex = index}
                aria-label="Go to project {index + 1}"
              ></button>
            {/each}
          </div>
        {/if}
      </div>
    </section>

    <section class="contact-section">
      <h2>Contact</h2>
      <p>For inquiries or collaboration opportunities, reach out at <a href="mailto:vivan.jaiswal924@gmail.com">vivan.jaiswal924@gmail.com</a></p>
      <p class="social-links">I'm on <a href="https://github.com/vivan-j" target="_blank" rel="noopener noreferrer">GitHub</a>, <a href="https://instagram.com/vivan.jaiswal1" target="_blank" rel="noopener noreferrer">Instagram</a></p>
    </section>
  </div>
</div>

<div class="particles">
  {#each Array(20) as _, i}
    <div class="particle" style="--delay: {i * 0.5}s; --x: {Math.random() * 100}%; --y: {Math.random() * 100}%;"></div>
  {/each}
</div>
