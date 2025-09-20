<script lang="ts">
  import SplitText from '$lib/SplitText.svelte';
  import Squares from '$lib/Squares.svelte';
  import PageInit from '$lib/PageInit.svelte';

  // no component logic; initialization handled by PageInit
</script>

<!-- Hero Section - Full Viewport -->
<section class="hero-section">
  <Squares direction="diagonal" speed={0.5} borderColor="#30363d" />
  
  <div class="hero-content">
    <SplitText text="Vivan Jaiswal" tag="h1" className="hero-title" />
    <SplitText text="Aspiring Web Developer" tag="p" className="hero-subtitle" />
  </div>
  
  <!-- Scroll Arrow -->
  <div class="scroll-arrow" role="button" tabindex="0">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M7 10L12 15L17 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  </div>
</section>

<PageInit />

<!-- Main Content - Hidden initially, revealed on scroll -->
<div class="container">
  <main>
    <section id="about">
      <h2>About Me</h2>
      <p>I'm a high school student passionate about technology and coding, currently learning web development. I am always looking to improve and explore new skills, especially in Javascript, Java, and Python. Some of my interests are chess, robotics <a href="https://www.firstinspires.org/robotics/ftc"> (FTC)</a>, and video games.</p>
    </section>

    <section id="projects">
      <h2>My Projects</h2>
      <div class="project-grid">
        <div class="project-card" role="article">
          <h3>
            <!-- svelte-ignore a11y_invalid_attribute -->
            <a href="#" target="_blank" rel="noopener noreferrer">
              abcBot (WIP)
            </a>
          </h3>
          <p>abcBot is a discord bot made in Python which lets you talk to AI models, some of which are fine-tuned for specific tasks.</p>
        </div>
        <div class="project-card" role="article">
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
