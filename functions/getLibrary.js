const path = require('path')
require('isomorphic-fetch')
const parse = require('csv-parse')

const fetchPromises = [
    fetch('https://' + process.env.THEME_SHEET),
    fetch('https://' + process.env.BOOKS_SHEET),
]

exports.handler = async (event,context, callback) => {
    const data = await Promise.all(fetchPromises).then(responses => responses.map(res => res.clone().text()))
            .then(csvPromises => Promise.all(csvPromises).then(async csvData => {
                let [siteData, books] = (await Promise.all(csvData.map(csv => parseStreamPromise(csv))))
                    .map(dataArr => dataArr.map(strToBool))

                if (siteData[0].ignoreArticlesInSort) {
                    function filterArticles(str) {
                        return str.toLowerCase().replace(/^the |^an |^a /, '')
                    }

                    books = books.sort((bookA, bookB) => filterArticles(bookA.title) > filterArticles(bookB.title) ? 1 : -1)
                }

                return { 
                    siteData,
                    books,
                }
            })
        ).catch(err => {
            console.error(err)
            callback(err, {
                statusCode: 502,
                headers: {
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify(err)
            })
        })

    callback(null, {
        statusCode: 200,
        headers: {
            'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify(data)
    })
}

function parseStreamPromise(csvData) {
    return new Promise((resolve, reject) => {
        parse(csvData, { 
            columns: true,
            skip_lines_with_error: true,
         }, function(err, result) {
            if (err) { reject(err) }
            else { resolve(result) }
        })
    })
}

function strToBool(obj) {
    function swapStr(str) {
        if (str === 'FALSE') return false
        if (str === 'TRUE') return true
        else return str
    }
    const newObj = {}
    for (key of Object.keys(obj)) {
        newObj[key] = swapStr(obj[key])
    }
    return newObj
}