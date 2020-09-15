import Fuse from 'fuse.js'
import { writable, derived } from 'svelte/store'

export const libraryStore = writable({
    books: [],
    siteData: [],
})

export const currThemeIndex = writable(0)

export const currTheme = derived([libraryStore, currThemeIndex], ([$libraryStore, $currThemeIndex]) => $libraryStore.siteData[$currThemeIndex])

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
export const search = writable('')

export const filteredBooks = derived([libraryStore, currThemeIndex, fuse, filters, search], ([$libraryStore, $currThemeIndex, $fuse, $filters, $search]) => {
    const searchResults = ($search) ? $fuse.search($search).map(res => res.item) : $libraryStore.books
    console.log('$libraryStore.siteData', $libraryStore.siteData)
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