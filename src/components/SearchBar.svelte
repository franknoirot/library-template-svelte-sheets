<script>
    import { search } from '../stores.js'

    function updateSearch(e) {
        $search = e.target.value
        console.log('$search = ', $search)
    }
</script>

<div class='library-search'>
    <label for='search-input'>Search</label>
    <input id='search-input' type='text' on:input={ updateSearch } />
</div>

<style>
    .library-search {
        margin: 1em 5vw;
    }
</style>