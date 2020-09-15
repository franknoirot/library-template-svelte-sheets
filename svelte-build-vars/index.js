import fs from 'fs'
import requireFromString from 'require-from-string'

export default async ({ content, attributes }) => {
		// only run on script tags with role='build-vars'
    if (attributes.role !== 'build-vars') return
    
		// find all variables and constants with filenames assigned to them
    let variables = content.split(/;\s*\n\t?|\s*\n\t?/g)
        .map(str => str.trim())
        .filter(possibleVarStr => possibleVarStr && !possibleVarStr.startsWith('//') && /const|let|var/.test(possibleVarStr))
        .map(varStr => {
            const matches = /(const|let|var)\s+(\w+)\s+=\s+(\S+)/.exec(varStr)

            return {
                name: matches[2],
                path: matches[3].replace(/'|"|`/g, ''),
            }
        });

		// read the content of each variable's file within a predefined folder
    let variablePromises = await Promise.all(variables.map(async varObj => {
        var strFileContents = fs.readFileSync( './src/svelte-build-vars/'+varObj.path, 'utf8' );

        return requireFromString(strFileContents)
    }))

		// reconstruct a string of valid javascript that sets the output of the code
    // from each variable's file to that variable
    const code = `\t` + variables.map((varObj, i) => {
        return `let ${ varObj.name } = ${ JSON.stringify(variablePromises[i]) };`
    }).join('\n\t')

        return { code }
}