<script lang="ts">
  import { onMount } from 'svelte';

  let isActive = false;
  let isStarted = false;
  let currentIndex = 0;
  let startTime = 0;
  let wpm = 0;
  let accuracy = 100;
  let showResult = false;
  let errors = 0;
  let correctChars = 0;
  let timeLeft = 15;
  let timer: number;
  let currentWordIndex = 0;
  let currentLine = 0;
  let textElement: HTMLElement;

const words = [
  // Basic English
  'the', 'quick', 'brown', 'fox', 'jumps', 'over', 'lazy', 'dog', 'and', 'runs', 'away',
  'sun', 'moon', 'light', 'dark', 'river', 'mountain', 'tree', 'wind', 'sky', 'cloud',
  'stone', 'grass', 'water', 'fire', 'earth', 'metal', 'sound', 'silence', 'dream', 'reality',

  // Common verbs
  'run', 'walk', 'jump', 'fly', 'build', 'break', 'code', 'write', 'read', 'sleep',
  'eat', 'drink', 'think', 'create', 'destroy', 'listen', 'speak', 'open', 'close', 'move',

  // Common adjectives
  'bright', 'dark', 'slow', 'fast', 'simple', 'complex', 'happy', 'sad', 'strong', 'weak',
  'sharp', 'smooth', 'quiet', 'loud', 'cold', 'warm', 'new', 'old', 'clear', 'blurred',

  // Programming keywords
  'function', 'const', 'let', 'var', 'return', 'if', 'else', 'for', 'while', 'class',
  'import', 'export', 'async', 'await', 'promise', 'array', 'object', 'string', 'number',
  'boolean', 'null', 'undefined', 'try', 'catch', 'throw', 'switch', 'case', 'break', 'continue',

  // Frameworks, libraries, and tech
  'javascript', 'typescript', 'python', 'java', 'csharp', 'react', 'svelte', 'vue', 'angular',
  'node', 'express', 'nextjs', 'nuxt', 'vite', 'tailwind', 'prisma', 'mongodb', 'postgres', 'mysql',
  'firebase', 'supabase', 'redis', 'docker', 'kubernetes', 'linux', 'windows', 'macos',

  // Tools and workflow
  'build', 'test', 'debug', 'deploy', 'merge', 'commit', 'push', 'pull', 'branch', 'clone',
  'lint', 'format', 'compile', 'run', 'execute', 'install', 'update', 'version', 'publish', 'rollback',

  // UI/UX
  'button', 'input', 'label', 'modal', 'form', 'menu', 'tab', 'card', 'grid', 'layout',
  'theme', 'color', 'border', 'shadow', 'icon', 'avatar', 'dropdown', 'tooltip', 'sidebar', 'navbar',

  // Files and extensions
  'html', 'css', 'json', 'yaml', 'svg', 'png', 'jpg', 'gif', 'pdf', 'txt',
  'csv', 'md', 'ts', 'tsx', 'jsx', 'xml', 'env', 'lock', 'readme', 'index',

  // Concepts
  'algorithm', 'data', 'logic', 'memory', 'cache', 'network', 'server', 'client', 'protocol', 'api',
  'frontend', 'backend', 'fullstack', 'auth', 'token', 'session', 'cookie', 'encryption', 'hash', 'security',

  // Misc tech nouns
  'bot', 'agent', 'assistant', 'model', 'query', 'response', 'request', 'route', 'endpoint', 'schema',
  'component', 'hook', 'context', 'store', 'state', 'effect', 'signal', 'event', 'listener', 'handler',

  // Random extras
  'space', 'time', 'machine', 'energy', 'dream', 'ocean', 'storm', 'echo', 'path', 'gate',
  'core', 'shell', 'frame', 'mirror', 'key', 'door', 'pulse', 'seed', 'field', 'loop'
];


  let displayWords: string[] = [];
  let typedHistory: { char: string; correct: boolean }[] = [];

  function updateLinePosition() {
    if (!textElement) return;
    
    // find the current character element
    const currentChar = textElement.querySelector('.current');
    if (!currentChar) return;
    
    // get the line height (1.8em)
    const lineHeight = 1.8 * parseFloat(getComputedStyle(textElement).fontSize);
    
    // calculate which line the current character is on
    const charTop = (currentChar as HTMLElement).offsetTop;
    const newLine = Math.floor(charTop / lineHeight);
    
    // if we've completed the 3rd visible line (line index 2), scroll down by 3 lines
    if (newLine >= currentLine + 3) {
      currentLine += 3; // jump 3 lines down
      const offset = currentLine * lineHeight;
      textElement.style.transform = `translateY(-${offset}px)`;
    }
  }

  function generateWords(count = 50) {
    const result = [];
    for (let i = 0; i < count; i++) {
      result.push(words[Math.floor(Math.random() * words.length)]);
    }
    return result;
  }

  function startTest() {
    if (isStarted) return;
    
    isActive = true;
    isStarted = true;
    startTime = Date.now();
    currentIndex = 0;
    currentWordIndex = 0;
    errors = 0;
    correctChars = 0;
    timeLeft = 15;
    typedHistory = [];
    // don't regenerate words - keep the preview words
    
    // 15 second countdown timer
    timer = setInterval(() => {
      timeLeft--;
      
      // calculate live wpm
      if (correctChars > 0) {
        const minutes = (15 - timeLeft) / 60;
        wpm = Math.round((correctChars / 5) / minutes);
      }
      
      if (timeLeft <= 0) {
        finishTest();
      }
    }, 1000);
  }

  function handleKeydown(event: KeyboardEvent) {
    // allow keyboard shortcuts (ctrl, alt, cmd combinations)
    if (event.ctrlKey || event.altKey || event.metaKey) {
      return; // don't prevent default, let browser handle shortcuts
    }
    
    if (showResult) return;
    
    if (!isStarted) {
      // only start on regular typing keys, not special keys
      if (event.key.length === 1 && !event.ctrlKey && !event.altKey && !event.metaKey) {
        startTest();
      } else {
        return;
      }
    }
    
    if (!isActive) return;

    const key = event.key;
    
    if (key === 'Backspace') {
      event.preventDefault();
      if (currentIndex > 0) {
        currentIndex--;
        typedHistory.pop();
      }
      return;
    }

    if (key.length !== 1) return; // ignore special keys
    
    event.preventDefault();
    
    const targetText = displayWords.join(' ');
    const targetChar = targetText[currentIndex];
    
    if (!targetChar) {
      // add more words if we're running out
      displayWords = [...displayWords, ...generateWords(20)];
    }
    
    const isCorrect = key === targetChar;
    
    typedHistory.push({ char: key, correct: isCorrect });
    
    if (isCorrect) {
      correctChars++;
    } else {
      errors++;
    }
    
    currentIndex++;
    
    // calculate accuracy
    const totalTyped = correctChars + errors;
    accuracy = totalTyped > 0 ? Math.round((correctChars / totalTyped) * 100) : 100;
    
    // update line position after a short delay to let DOM update
    setTimeout(updateLinePosition, 10);
  }

  function finishTest() {
    isActive = false;
    showResult = true;
    clearInterval(timer);
    
    // final calculations
    const minutes = 15 / 60; // 15 seconds = 0.25 minutes
    wpm = Math.round((correctChars / 5) / minutes);
  }

  function reset() {
    isActive = false;
    isStarted = false;
    showResult = false;
    currentIndex = 0;
    currentWordIndex = 0;
    currentLine = 0;
    errors = 0;
    correctChars = 0;
    timeLeft = 15;
    wpm = 0;
    accuracy = 100;
    typedHistory = [];
    displayWords = generateWords();
    clearInterval(timer);
    
    // reset text position
    if (textElement) {
      textElement.style.transform = 'translateY(0px)';
    }
  }

  onMount(() => {
    displayWords = generateWords();
    
    // always start at the top of the page
    window.scrollTo(0, 0);
    
    return () => clearInterval(timer);
  });
</script>

<div class="typing-test">
  {#if !isStarted && !showResult}
    <div class="prompt">
      <p>start typing to begin 15s test</p>
    </div>
  {/if}

  <div class="text-display" class:active={isStarted}>
    <div class="text-lines" bind:this={textElement}>
      {#each displayWords.join(' ').split('') as char, i}
        <span 
          class:correct={i < currentIndex && typedHistory[i]?.correct}
          class:incorrect={i < currentIndex && !typedHistory[i]?.correct}
          class:current={i === currentIndex && isActive}
          class:pending={i > currentIndex}
        >
          {char}
        </span>
      {/each}
    </div>
  </div>

  {#if isActive}
    <div class="live-stats">
      <span class="stat">
        <span class="label">wpm</span>
        <span class="value">{wpm}</span>
      </span>
      <span class="stat">
        <span class="label">acc</span>
        <span class="value">{accuracy}%</span>
      </span>
      <span class="stat">
        <span class="label">time</span>
        <span class="value">{timeLeft}s</span>
      </span>
    </div>
  {/if}

  {#if showResult}
    <div class="results">
      <div class="final-stats">
        <div class="main-stat">
          <span class="big-number">{wpm}</span>
          <span class="label">wpm</span>
        </div>
        <div class="secondary-stats">
          <span>{accuracy}% accuracy</span>
          <span>{correctChars + errors} characters</span>
          <span>{errors} errors</span>
        </div>
      </div>
      <button class="retry-btn" on:click={reset}>try again</button>
    </div>
  {/if}
</div>

<svelte:window on:keydown={handleKeydown} />

<style>
  .typing-test {
    font-family: 'IBM Plex Mono', monospace;
    max-width: 100%;
    position: relative;
  }

  .prompt {
    text-align: center;
    margin-bottom: 1rem;
  }

  .prompt p {
    color: var(--text-secondary);
    font-size: 0.9rem;
    opacity: 0.7;
    margin: 0;
  }

  .text-display {
    font-size: 1.1rem;
    line-height: 1.8;
    margin-bottom: 1.5rem;
    padding: 1rem;
    border-radius: 6px;
    background: rgba(96, 165, 250, 0.02);
    border: 1px solid rgba(96, 165, 250, 0.05);
    transition: all 0.3s ease;
    cursor: text;
    user-select: none;
    height: calc(1.8em * 3 + 2rem); /* exactly 3 lines + padding */
    overflow: hidden;
    position: relative;
  }

  .text-lines {
    position: absolute;
    top: 1rem;
    left: 1rem;
    right: 1rem;
    transition: transform 0.3s ease;
    word-wrap: break-word;
    line-height: 1.8;
  }

  .text-display.active {
    border-color: rgba(96, 165, 250, 0.1);
    background: rgba(96, 165, 250, 0.03);
  }

  .text-display span {
    position: relative;
    transition: all 0.1s ease;
  }

  .text-display span.pending {
    color: var(--text-secondary);
    opacity: 0.6;
  }

  .text-display span.correct {
    color: var(--text-color);
    background: rgba(34, 197, 94, 0.1);
  }

  .text-display span.incorrect {
    color: #ef4444;
    background: rgba(239, 68, 68, 0.15);
  }

  .text-display span.current {
    background: var(--accent-color);
    color: var(--background-color);
    animation: pulse 1s infinite;
  }

  @keyframes pulse {
    0%, 50% { opacity: 1; }
    51%, 100% { opacity: 0.7; }
  }



  .live-stats {
    display: flex;
    gap: 2rem;
    justify-content: center;
    margin-bottom: 1rem;
    font-size: 0.85rem;
  }

  .stat {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
  }

  .stat .label {
    color: var(--text-secondary);
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .stat .value {
    color: var(--accent-color);
    font-weight: 600;
    font-size: 1rem;
  }

  .results {
    text-align: center;
    animation: fadeIn 0.5s ease;
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .final-stats {
    margin-bottom: 1.5rem;
  }

  .main-stat {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }

  .big-number {
    font-size: 3rem;
    font-weight: 700;
    color: var(--accent-color);
    line-height: 1;
  }

  .main-stat .label {
    color: var(--text-secondary);
    font-size: 0.9rem;
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }

  .secondary-stats {
    display: flex;
    gap: 1.5rem;
    justify-content: center;
    font-size: 0.85rem;
    color: var(--text-secondary);
  }

  .retry-btn {
    background: none;
    border: 1px solid rgba(96, 165, 250, 0.2);
    color: var(--text-secondary);
    padding: 0.5rem 1rem;
    border-radius: 4px;
    font-size: 0.85rem;
    cursor: pointer;
    transition: all 0.2s ease;
    font-family: inherit;
  }

  .retry-btn:hover {
    border-color: var(--accent-color);
    color: var(--accent-color);
  }

  @media (max-width: 480px) {
    .text-display {
      font-size: 1rem;
      padding: 0.75rem;
    }

    .live-stats {
      gap: 1rem;
    }

    .secondary-stats {
      flex-direction: column;
      gap: 0.5rem;
    }

    .big-number {
      font-size: 2.5rem;
    }
  }
</style>