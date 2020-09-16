import Fuse from 'fuse.js'
import { readable, writable, derived, get } from 'svelte/store'

const queryParams = new URLSearchParams(window.location.search)

export const libraryStore = writable({
    books: [],
    siteData: [],
})

export const currThemeIndex = writable((queryParams.get('t') !== null) ? parseInt(queryParams.get('t')) : 0)

export const currTheme = derived([libraryStore, currThemeIndex], ([$libraryStore, $currThemeIndex]) => $libraryStore.siteData[$currThemeIndex])

export const comparisons = readable([
    {short: '<', label: 'is less than', fn: (a, b) => (a && a !== null) && ((typeof a === 'string') ? a < b : a < parseInt(b)) },
    {short: '>', label: 'is greater than', fn: (a, b) =>  (a && a !== null) && ((typeof a === 'string') ? a > b : a > parseInt(b)) },
    {short: '=', label: 'is equal to', fn: (a, b) =>  (a && a !== null) && ((typeof a === 'string') ? a === b : a === parseInt(b)) },
    {short: 'contains', label: 'contains', fn: (a, b) => (a && a !== null) && (a.toString().includes(b.toString())) },
    {short: "doesn't contain", label: "doesn't contain", fn: (a, b) => (a && a !== null) && (!a.toString().includes(b.toString())) },
])

export const filters = writable([])

const fuseOptions = {
    includeScore: true,
    threshold: .4,
    keys: [
        { name: 'title', weight: .5 }, 
        { name: 'subtitle', weight: .2 },
        { name: 'author', weight: .3 },
    ]
}
const fuse = derived([libraryStore], ([$libraryStore]) => new Fuse($libraryStore.books, fuseOptions))
export const search = writable((queryParams.get('s') !== null) ? decodeURIComponent(queryParams.get('s')) : '')

export const filteredBooks = derived([libraryStore, currThemeIndex, fuse, filters, search], ([$libraryStore, $currThemeIndex, $fuse, $filters, $search]) => {
    const searchResults = ($search) ? $fuse.search($search).map(res => res.item) : $libraryStore.books

    // Side effect alert: using this derived opportunity to also update the site's query params
    setQueryParams({   
        s: $search,
        t: $currThemeIndex,
        f: $filters.map(({ prop, comparison: { short }, value}) => [prop, short, value].join('-')).join('--')
    })

    let filteredResults = ($libraryStore.siteData.length > 0)
        ? filterResults(searchResults, $filters,
            ($libraryStore.siteData[$currThemeIndex].ignoreArticlesInSort) ? [{ prop: 'title', hook: t => t.toLowerCase().replace(/^the |^an |^a /, '') }] : [])
            .filter(book => book.show)
        : searchResults

    return filteredResults
})

function filterResults(results, filters, propHooks) {
    return (!filters || !filters.length)
        ? results
        : results.filter(result => filters.every(filter => {
            const foundHook = propHooks.find(h => h.prop === filter.prop)
            const sendVal = ((hook) => (val) => (hook) ? hook.hook(val) : val)(foundHook)

            return filter.comparison.fn(sendVal(result[filter.prop]), sendVal(filter.value)) 
        }))
}

function setQueryParams(state) {
    for (const [key, value] of Object.entries(state)) {
        if (value) {
            queryParams.set(key, encodeURIComponent(value))
        } else {
            queryParams.delete(key)
        }
    }

    history.replaceState(null, null, "?"+queryParams.toString());
}