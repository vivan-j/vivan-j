<script lang="ts">
  import PageInit from '$lib/PageInit.svelte';
  import { onMount } from 'svelte';

  let projectsOpen = false;
  let roboticsOpen = false;
  let emailCopied = false;
  let viewCount = 0;

  // real view counter from server
  onMount(async () => {
    try {
      const response = await fetch('/api/analytics');
      const data = await response.json();
      viewCount = data.views || 0;
    } catch (error) {
      console.error('failed to fetch view count:', error);
      viewCount = 0;
    }
  });

  const projects = [
    {
      name: 'game hub',
      url: 'https://math.vivanj.dev',
      description: 'browser games library built from a fork. no downloads required.'
    },
    {
      name: 'smth.tech',
      url: 'https://smth.tech',
      description: 'timer, unit converter, weather, wordle, and more. free tools without ads.'
    },
    {
      name: 'abcBot',
      url: '#',
      description: 'discord bot with ai integrations. not done yet.',
      wip: true
    }
  ];

  // tab title typing thing
  onMount(() => {
    const name = 'vivan jaiswal';
    const cursor = '|';
    let currentIndex = 0;
    let isTyping = true;
    let showCursor = true;
    let timeoutId: number;
    
    const updateTitle = () => {
      // clear timeout
      if (timeoutId) clearTimeout(timeoutId);
      
      if (isTyping) {
        currentIndex++;
        const currentText = name.substring(0, currentIndex);
        document.title = currentText + (showCursor ? cursor : '');
        
        if (currentIndex >= name.length) {
          isTyping = false;
          // blink cursor
          blinkCursor();
          timeoutId = setTimeout(() => {
            showCursor = true;
            updateTitle();
          }, 2000); // pause at end
        } else {
          timeoutId = setTimeout(updateTitle, 200); // typing speed
        }
      } else {
        currentIndex--;
        
        if (currentIndex <= 1) {
          // stop at v|
          document.title = name.substring(0, 1) + cursor;
          isTyping = true;
          showCursor = true;
          timeoutId = setTimeout(updateTitle, 1500); // pause
        } else {
          document.title = name.substring(0, currentIndex);
          timeoutId = setTimeout(updateTitle, 120); // delete speed
        }
      }
    };
    
    const blinkCursor = () => {
      if (!isTyping && currentIndex >= name.length) {
        showCursor = !showCursor;
        document.title = name + (showCursor ? cursor : '');
        setTimeout(blinkCursor, 500); // blink speed
      }
    };
    
    // start
    updateTitle();
    
    // cleanup
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  });
</script>

<PageInit />

<div class="page">
  <main>
    <div class="intro-section">
      <h1>vivan jaiswal</h1>
      <p>i'm 15, based in sharon, ma. i build web apps and compete in robotics.</p>
      <p>currently working with sveltekit, javascript, java, and python. part of first tech challenge team #27369 deeptech.</p>
      
      <div class="contact">
        <button 
          class="email-copy" 
          on:click={() => {
            navigator.clipboard.writeText('hi@smth.tech');
            emailCopied = true;
            setTimeout(() => emailCopied = false, 2000);
          }}
        >
          {emailCopied ? 'copied!' : 'hi@smth.tech'}
        </button>
        <div class="links">
          <a href="https://github.com/vivan-j">github</a>
          <a href="https://linkedin.com/in/vivanj">linkedin</a>
          <a href="https://instagram.com/vivan.jaiswal1">instagram</a>
        </div>
      </div>
    </div>

    <div class="projects">
      <button class="projects-toggle" on:click={() => {
        projectsOpen = !projectsOpen;
        if (projectsOpen) {
          setTimeout(() => {
            document.querySelector('.projects')?.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'start',
              inline: 'nearest'
            });
          }, 200);
        }
      }}>
        <span>projects ({projects.length})</span>
        <span class="arrow" class:open={projectsOpen}>↓</span>
      </button>
      
      {#if projectsOpen}
        <div class="projects-list">
          {#each projects as project}
            <div class="project">
              <div class="project-title">
                {#if project.wip}
                  <span class="name">{project.name}</span>
                  <span class="status">work in progress</span>
                {:else}
                  <a href={project.url} target="_blank" rel="noopener noreferrer">{project.name}</a>
                {/if}
              </div>
              <p>{project.description}</p>
            </div>
          {/each}
        </div>
      {/if}
    </div>

    <div class="robotics">
      <button class="robotics-toggle" on:click={() => {
        roboticsOpen = !roboticsOpen;
        if (roboticsOpen) {
          setTimeout(() => {
            document.querySelector('.robotics')?.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'start',
              inline: 'nearest'
            });
          }, 200);
        }
      }}>
        <span>robotics</span>
        <span class="arrow" class:open={roboticsOpen}>↓</span>
      </button>
      
      {#if roboticsOpen}
        <div class="robotics-content">
          <p>i compete with team #27369 deeptech in <a href="https://www.firstinspires.org/robotics/ftc" target="_blank" rel="noopener noreferrer">first tech challenge</a>. we design, build, and program robots for competitions.</p>
          <p>it's taught me hardware and software integration and how to work under pressure with a team.</p>
        </div>
      {/if}
    </div>
  </main>
  
  <!-- subtle view counter -->
  {#if viewCount > 0}
    <div class="view-counter">
      visitor #{viewCount.toLocaleString()}
    </div>
  {/if}
</div>


