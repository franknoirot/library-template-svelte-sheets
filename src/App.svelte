<script context='module' role='build-vars'>
	export let libraryData = 'library.js';
</script>

<script>
    import { onMount } from 'svelte'
    import { get } from 'svelte/store'
    import { camelToTitleCase } from './functions/stringFns.js'
    import { libraryStore, currTheme, filters, filteredBooks, comparisons, isFirstRun } from './stores.js'
    import Helmet from './components/Helmet.svelte'
    import Navbar from './components/Navbar.svelte'
    import Book from './components/Book.svelte' 
    export let isLive = false
    export let isDev = false
    $libraryStore = libraryData
    
    onMount(async () => {
        if (isLive) {
            console.log(`Doin' it live!`)
            libraryData = await fetch(((isDev) ? 'http://localhost:8888' : '') + '/.netlify/functions/getLibrary', {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                }
            }).then(res => res.json())
            console.log('libraryData = ', libraryData)
            $libraryStore = libraryData
        }

        const queryParams = new URLSearchParams(window.location.search)
        if (queryParams.get('f') !== null) {
            $filters = decodeURIComponent(queryParams.get('f')).split('--').map(fStr => {
                const filterArr = fStr.split('-')
                const prop = get(currTheme).filterFields.split(',').find(field => field.trim() === filterArr[0]).trim()

                console.log(`"${ prop }"`)

                return {
                    uid: Math.random().toString(36).slice(2,9),
                    prop,
                    label: camelToTitleCase(prop),
                    comparison: get(comparisons).find(c => c.uri === filterArr[1]),
                    value: filterArr[2],
                }
            })
        }

        $isFirstRun = false
    })

    $: featuredBook = libraryData.books.find(book => book.title === $currTheme.featuredBook)
</script>

<div id='style-wrap' style='{ Object.keys($currTheme).map(key => `--${key}: ${$currTheme[key]};`).join(' ') }'>
<Helmet />
<Navbar />
<section id='library-intro'>
    <p>I took a photo of every book in my apartment and put it here along with some data and a review for the books I've got something 
    to say about. This site is exciting to me because all the data for it comes from a <a href="https://docs.google.com/spreadsheets/d/1L6pFNR2fB9451zNvaNzXW_tFJ2ko7YqvuD8qmNz0NWk/edit?usp=sharing" target="_blank" rel="noopener">Google Sheet</a>, including the themes, making it 
    really easy to edit. I'd like to explore making a tool that spits out little library sites for people. This one's built using <a href='https://github.com/franknoirot/library-template-svelte' target='_blank' rel='noopener'>Svelte</a> but could be built using any static site generator.
    I've made another version using <a href='https://github.com/franknoirot/library-template' target='_blank' rel='noopener noreferrer'>11ty</a> for example.
    </p>
    <div id='currently-reading'>
        <div class='featured-book'>
            <img alt={ featuredBook.title + ' book cover'} src="/img/books/{ featuredBook.coverImg }"/>
        </div>
        <h2><small>Currently Reading:</small><br>{ featuredBook.title }</h2>
    </div>
</section>
<main id='library'>
    <section class='library-grid'>
		{#each $libraryStore.books.filter(b => b.show) as book, i (`book-${ i }`)}
			<Book data={ book } index={ i } visible={ $filteredBooks.findIndex(b => b.title === book.title) >= 0 } />
        {/each}
    </section>
    <button class='back-to-top' on:click={ () => window.scrollTo({ top: 0, left: 0, behavior: "smooth"}) }>Back to Top</button>
</main>
</div>

<style>

</style>