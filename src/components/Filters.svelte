<script>
    import { currTheme, filters, comparisons } from '../stores.js'
    import { camelToTitleCase } from '../functions/stringFns.js'

    export let active = false
    $: filterParams = $currTheme.filterFields.split(',').map(filter => {
        return {
            label: camelToTitleCase(filter.trim()),
            prop: filter.trim(),
        }
    })

    function addFilter(e) {
        e.preventDefault()

        const filterVals = Array.from(e.target.elements).map(el => el.value).slice(0, -1)

        $filters = [
            {
                uid: Math.random().toString(36).slice(2,9),
                ...filterParams.find(f => f.prop === filterVals[0]),
                comparison: $comparisons.find(c => c.short === filterVals[1]),
                value: filterVals[2],
            },
            ...$filters
        ]
        e.target.children[0].focus()
    }

    function removeFilter(index) {
        $filters = [ ...$filters.slice(0, index), ...$filters.slice(index + 1, $filters.length) ]
    }
</script>

<div class='lib-control filters'>
    <button id='toggle-filters' class='toggle' class:active={ active } on:click>
        {#if $filters.length > 0}
        <strong>{ $filters.length} </strong>
        {/if}
        Filters</button>
    <div class='filters-inner'>
        <form id='filter-add-form' on:submit={ addFilter }>
            <select id='filter-param-dropdown'>
                {#each filterParams as param, i ('param-'+i)}
                <option value={ param.prop }>{ param.label }</option>
                {/each}
            </select>
            <select id='filter-comp-dropdown'>
                {#each $comparisons as comp, j ('comparison-'+j)}
                <option value={comp.short}>{ comp.label }</option>
                {/each}
            </select>
            <input id='filter-val-input' type='text' placeholder="ex: T, 1980, 4" required>
            <button id='filter-add-btn' type='submit'>Add +</button>
        </form>
        <div id='filter-tags-container' aria-live="polite">
            <strong>Current Filters:</strong>
            {#if $filters.length < 1}
            <span id='no-filters'>None</span>
            {:else}
            {#each $filters as filter, k ('filter-'+k)}
            <button id={'filter-'+filter.uid} class='tag' on:click={() => removeFilter(k)}>{ `${ filter.label } ${ filter.comparison.short } "${ filter.value }"` }</button>
            {/each}
            {/if}
        </div>
    </div>
</div>