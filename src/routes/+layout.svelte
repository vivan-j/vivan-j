<script lang="ts">
	import '../app.css';
	import './page-styles.css';
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<!-- Using Apple system fonts; no external font loads -->
</svelte:head>

{@render children?.()}
