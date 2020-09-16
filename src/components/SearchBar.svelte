<script>
    import { search } from '../stores.js'
</script>

<div class='library-search'>
    <label for='search-input'>Search</label>
    <input id='search-input' type='text' bind:value={ $search } />
</div>

<style>
    .library-search {
        margin: 1em 5vw;
    }
</style>