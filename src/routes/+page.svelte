<script lang="ts">
  import PageInit from '$lib/PageInit.svelte';
  import TypingTest from '$lib/TypingTest.svelte';
  import { onMount } from 'svelte';

  let projectsOpen = false;
  let roboticsOpen = false;
  let emailCopied = false;
  let viewCount = 0;
  let currentAge = 15;
  let isDarkMode = true;
  let chessStats: any = null;
  let typingTestVisible = false;

  // figure out my age from my birthday
  function calculateAge() {
    const today = new Date();
    const birthDate = new Date(today.getFullYear(), 8, 24); // months are 0-indexed
    
    if (today < birthDate) {
      birthDate.setFullYear(today.getFullYear() - 1);
    }
    
    const birthYear = 2010;
    const currentYear = today.getFullYear();
    const hasHadBirthdayThisYear = today >= new Date(currentYear, 8, 24);
    
    return hasHadBirthdayThisYear ? currentYear - birthYear : currentYear - birthYear - 1;
  }

  function toggleTheme() {
    isDarkMode = !isDarkMode;
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }

  // pull view count when page loads
  onMount(async () => {
    currentAge = calculateAge();
    
    // check for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      isDarkMode = savedTheme === 'dark';
    } else {
      isDarkMode = true;
    }
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
    
    try {
      const response = await fetch('/api/analytics');
      const data = await response.json();
      viewCount = data.views || 0;
    } catch (error) {
      console.error('failed to fetch view count:', error);
      viewCount = 0;
    }

    // fetch chess stats
    try {
      const response = await fetch('/api/chess');
      const data = await response.json();
      if (data.rapid) {
        chessStats = data;
      }
    } catch (error) {
      console.error('failed to fetch chess stats:', error);
    }

    // typing test easter egg - press 't' to reveal
    window.addEventListener('keydown', (e) => {
      if (e.key === 't' || e.key === 'T') {
        typingTestVisible = true;
      }
    });
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

  // removed the title animation because it was showing partial text in search results and embeds
  // keeping it static lets the full name show up everywhere
</script>

<PageInit />

<div class="page">
  <main>
    <div class="intro-section">
      <h1 class="name-hover">
        <span>v</span><span>i</span><span>v</span><span>a</span><span>n</span> <span>j</span><span>a</span><span>i</span><span>s</span><span>w</span><span>a</span><span>l</span>
      </h1>
      <p>i'm {currentAge}, based in sharon, ma. i build web apps and compete in robotics.</p>
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
          <span class="link-with-tooltip">
            <a href="https://github.com/vivan-j" target="_blank" rel="noopener noreferrer">github</a>
            <span class="link-tooltip">vivan-j</span>
          </span>
          <span class="link-with-tooltip">
            <a href="https://linkedin.com/in/vivanj" target="_blank" rel="noopener noreferrer">linkedin</a>
            <span class="link-tooltip">vivanj</span>
          </span>
          <span class="link-with-tooltip">
            <a href="https://instagram.com/vivan.jaiswal1" target="_blank" rel="noopener noreferrer">instagram</a>
            <span class="link-tooltip">vivan.jaiswal1</span>
          </span>
          <span class="chess-link">
            <a href="https://www.chess.com/member/chesschampv1" target="_blank" rel="noopener noreferrer">chess.com</a>
            {#if chessStats}
              <span class="chess-tooltip">{chessStats.rapid}</span>
            {/if}
          </span>

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

    <!-- typing test easter egg - press 't' to reveal -->
    {#if typingTestVisible}
      <div class="typing-section">
        <TypingTest />
      </div>
    {/if}
  </main>
  
  <!-- subtle theme toggle -->
  <button class="theme-toggle" on:click={toggleTheme} title={isDarkMode ? 'switch to light mode' : 'switch to dark mode'}>
    <div class="moon-icon" class:light={!isDarkMode}></div>
  </button>

  <!-- subtle view counter -->
  {#if viewCount > 0}
    <div class="view-counter">
      visitor #{viewCount.toLocaleString()}
    </div>
  {/if}
</div>


