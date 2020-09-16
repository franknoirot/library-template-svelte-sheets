import Fuse from 'fuse.js'
import { readable, writable, derived, get } from 'svelte/store'

export const isFirstRun = writable(true)

const queryParams = new URLSearchParams(window.location.search)

export const libraryStore = writable({
    books: [],
    siteData: [],
})

export const currThemeIndex = writable((queryParams.get('t') !== null) ? parseInt(queryParams.get('t')) : 0)

export const currTheme = derived([libraryStore, currThemeIndex], ([$libraryStore, $currThemeIndex]) => $libraryStore.siteData[$currThemeIndex])

export const comparisons = readable([
    {short: '<', label: 'is less than', uri: 'lt', fn: (a, b) => (a && a !== null) && ((typeof a === 'string') ? a < b : a < parseInt(b)) },
    {short: '>', label: 'is greater than', uri: 'gt', fn: (a, b) =>  (a && a !== null) && ((typeof a === 'string') ? a > b : a > parseInt(b)) },
    {short: '=', label: 'is equal to', uri: 'eq', fn: (a, b) =>  (a && a !== null) && ((typeof a === 'string') ? a === b : a === parseInt(b)) },
    {short: 'contains', label: 'contains', uri: 'c', fn: (a, b) => (a && a !== null) && (a.toString().includes(b.toString())) },
    {short: "doesn't contain", label: "doesn't contain", uri: 'dc', fn: (a, b) => (a && a !== null) && (!a.toString().includes(b.toString())) },
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

export const filteredBooks = derived([libraryStore, currThemeIndex, fuse, filters, search, isFirstRun], ([$libraryStore, $currThemeIndex, $fuse, $filters, $search, $isFirstRun]) => {
    const searchResults = ($search) ? $fuse.search($search).map(res => res.item) : $libraryStore.books

    // Side effect alert: using this derived opportunity to also update the site's query params
    setQueryParams({   
        s: $search,
        t: $currThemeIndex,
        f: $filters.map(({ prop, comparison: { uri }, value}) => [prop, uri, value].join('-')).join('--')
    }, $isFirstRun)

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

function setQueryParams(state, isFirstRun) {
    for (const [key, value] of Object.entries(state)) {
        if (value) {
            queryParams.set(key, encodeURIComponent(value))
        } else if (!isFirstRun || key !== 'f') {
            queryParams.delete(key)
        }
    }

    history.replaceState(null, null, location.pathname + ((Array.from(queryParams).length) ? ("?"+queryParams.toString()) : ''));
}