import * as vscode from 'vscode'


// Compare two uris.  In some cases this might need to be case insensitive
// Only for use with file, serenji, isfs and similar uri schemes
export function uriEqual(uri1, uri2) {
    if (uri1.scheme !== uri2.scheme) return false
    if (uri1.authority !== uri2.authority) return false
    if (uri1.path !== uri2.path) return false
    return true
}

