<script lang="ts">
  import { onMount } from 'svelte';
  import { PageAnimations } from '$lib/animations';

  onMount(async () => {
    const anim = new PageAnimations();
    await anim.init();
  });
</script>