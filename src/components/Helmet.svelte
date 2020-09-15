<script>
    import { currTheme } from '../stores.js'
    export let noindex = false
</script>

<svelte:head>
    <title>{ $currTheme.ownerName }'s Personal Library</title>
    {#if noindex }
    <meta name="robots" content="noindex, nofollow">
    {/if}
    <link href="https://fonts.googleapis.com/css2?family={ $currTheme.headingFont.replace(" ", "+") }&family={ $currTheme.bodyFont.replace(" ", "+") }&display=swap" rel="stylesheet">
</svelte:head>