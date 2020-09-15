<script>
    import Filters from './Filters.svelte'
    import SearchBar from './SearchBar.svelte'
    import { currTheme, currThemeIndex, filteredBooks, libraryStore } from '../stores.js'

    let themesActive = false, filtersActive = false
    let scroll = 0

    $: ownerName = $currTheme.ownerName
    $: numBooks = $filteredBooks.length

    function toggleControls(control) {
        if (control === 'filters') {
            themesActive = false
            filtersActive = !filtersActive
        } else if (control === 'themes') {
            themesActive = !themesActive
            filtersActive = false
        } else {
            themesActive = false
            filtersActive = false
        }
    }

    function escapeListener(e) {
        if (e.keyCode === 27) {
            toggleControls()
        }
    }
</script>

<svelte:window on:scroll={ () => scroll = window.scrollY } />
<nav class='top-navbar' class:stuck={ scroll > 0 }>
    <h1>{ ownerName }'s Library</h1>
    <div class='navbar-group js-deactivated' on:keydown={ escapeListener }>
        <div class='search-group'>
            <p id='result-count' aria-live="polite">{ numBooks } books</p>
            <SearchBar />
        </div>
        <Filters active={ filtersActive } on:click={ () => toggleControls('filters') }/>
        
        <div class='lib-control themes'>
            <button id='toggle-theme' class='toggle' class:active={ themesActive } on:click={ () => toggleControls('themes') }>Themes</button>
            <fieldset class='theme-picker'>
                {#each $libraryStore.siteData as theme, i (`theme-${ i }`) }
                <div>
                    <input id='theme-{ i }' type='radio' name='themes' value='{ i }' checked={ i === 0 } on:input={() => $currThemeIndex = i}>
                    <label for='theme-{ i }'>{ theme.themeName }</label> 
                </div>
                {/each}
            </fieldset>
        </div>
    </div>
</nav>