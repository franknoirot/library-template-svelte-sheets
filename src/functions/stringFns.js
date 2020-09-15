export function camelToTitleCase(str) {
    return str.slice(0,1).toUpperCase() + str.slice(1).replace(/[A-Z]/g, (s) => ' '+s.toUpperCase())
}