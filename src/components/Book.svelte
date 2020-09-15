<script>
    import slugify from 'slugify'
    export let data = {}
    export let index = 0
    export let visible = true
</script>

<article id='{ slugify(data.title) }' class='book-group' class:hidden={ !visible }>
    <input type="checkbox" class="visually-hidden" id='book-toggle-{ index }'>
    <label class='book-card' for='book-toggle-{ index }'>
        <div class='book-cover'>
            <img alt='{ data.title } cover' 
                 src='/img/books/{ data.coverImg }'
                 loading={ (index > 10) ? 'lazy' : '' }>
        </div>
        <div class='book-back'>
            <div class='top-line'>
                <h2>{ data.title }</h2>
                {#if data.subtitle }
                <p class='subtitle'><em>{ data.subtitle }</em></p>
                {/if}
            </div>
            <p>{ (!data.author && data.editor) ? `edited by ${ data.editor }` : `by ${ data.author }` }</p>
            <p>{ data.publishDate }{ (data.publishDate != data.firstPublished) ? `| first published ${ data.firstPublished }` : '' }</p>
            {#if data.rating || data.review }
                <div class='review-row'>
                    <h3>Review</h3>
                    {#if data.rating }
                    <span>{ Array.of(parseInt(data.rating)).fill('☆').join('').padStart(5, '★') }</span>
                    {/if}
                </div>
            {/if}
            {#if data.review }
                <p>{ data.review }</p>
            {/if}
            <hr>
            <p>{ data.pages } pages</p>
            {#if data.category }<p>Category: { data.category }</p>{/if}
            {#if data.translator }<p>Translated by { data.translator }</p>{/if}
            {#if data.publisher }
                <p>
                    Published by { data.publisher }{#if data.publishLocation } in { data.publishLocation }{/if}
                </p>
            {/if}
            {#if data.language }<p>Language: { data.language }</p>{/if}
            {#if data.status }<p>Status: { data.status }</p>{/if}
            {#if data.tags }<p>Tags: { data.tags }</p>{/if}
            <div class='borrowed-row' class:active={ data.isBorrowed }>
                <span>borrowed</span>
                <div class='book-toggle'></div>
                <span>available</span>
            </div>
            {#if !data.isBorrowed }
            <a class='borrow-cta' href='mailto:frank@franknoirot.co?subject=Request to Borrow: { data.title }'>Request to Borrow</a>
            {/if}
        </div>
    </label>
</article>

<style>

</style>