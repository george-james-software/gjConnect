'use strict'

import * as vscode from 'vscode'
import { uriEqual } from './util'


export async function register(context: vscode.ExtensionContext) {


    // Install Server Manager if not already installed
    const extId = "intersystems-community.servermanager"
    let extension = vscode.extensions.getExtension(extId)
    if (!extension) {
        await vscode.commands.executeCommand("workbench.extensions.installExtension", extId)
        extension = vscode.extensions.getExtension(extId)
    }
    if (!extension.isActive) await extension.activate()



    // Register gj::locate command for namespace context menu
    const gjLocate = vscode.commands.registerCommand('gjLocate.intersystems-servermanager', async (namespaceTreeItem) => {
        const idArray = namespaceTreeItem.id.split(':')
        const serverId = idArray[1]
        const namespace = idArray[3]

        const name = `Serenji: ${serverId} ${namespace}`        
        const serenjiWorkspaceUri = vscode.Uri.parse(`serenji://${serverId}/${namespace}`)

        const folderId = addWorkspaceFolder(serenjiWorkspaceUri, name)

        // Set focus to the workspace folder
        await vscode.commands.executeCommand('workbench.view.explorer')
        await vscode.commands.executeCommand('workbench.explorer.fileView.focus')

        // Set focus to the workspace folder
        await vscode.commands.executeCommand('workbench.view.explorer')
        await vscode.commands.executeCommand('workbench.explorer.fileView.focus')

        // Invoke gjLocate
        vscode.commands.executeCommand('gjLocate', folderId)
    })

    context.subscriptions.push(gjLocate) 


    // Register Serenji Debug command for namespace context menu
    const serenjiDebug = vscode.commands.registerCommand('serenjidebug.intersystems-servermanager', async (namespaceTreeItem) => {
        const idArray = namespaceTreeItem.id.split(':')
        const serverId = idArray[1]
        const namespace = idArray[3]

        const serenjiWorkspaceUri = vscode.Uri.parse(`serenji://${serverId}/${namespace}`)
        const name = `Serenji: ${serverId} ${namespace}`        

        const folderId = addWorkspaceFolder(serenjiWorkspaceUri, name)

        // Set focus to debug view
        await vscode.commands.executeCommand('workbench.view.debug')

    })

    context.subscriptions.push(serenjiDebug) 


    // Register Serenji Editor for namespace context menu
    const serenji = vscode.commands.registerCommand('serenji.intersystems-servermanager', async (namespaceTreeItem) => {
        const idArray = namespaceTreeItem.id.split(':')
        const serverId = idArray[1]
        const namespace = idArray[3]

        const name = `Serenji: ${serverId} ${namespace}`        
        const serenjiWorkspaceUri = vscode.Uri.parse(`serenji://${serverId}/${namespace}`)

        addWorkspaceFolder(serenjiWorkspaceUri, name)

        // Set focus to the workspace folder
        await vscode.commands.executeCommand('workbench.view.explorer')
        await vscode.commands.executeCommand('workbench.explorer.fileView.focus')

    })

    context.subscriptions.push(serenji) 


    // Register Deltanji Source Control Portal command for namespace menu
    const deltanji = vscode.commands.registerCommand('deltanji.intersystems-servermanager', async (namespaceTreeItem) => {
        const idArray = namespaceTreeItem.id.split(':')
        const serverId = idArray[1]
        const namespace = idArray[3]

        const serverManagerApi = extension.exports
        if (serverManagerApi && serverManagerApi.getServerSpec) {
            const serverSpec = await serverManagerApi.getServerSpec(serverId)

            const scheme = serverSpec.webServer.scheme
            const host = serverSpec.webServer.host
            const port = serverSpec.webServer.port

            const deltanjiUri = vscode.Uri.parse(`${scheme}://${host}:${port}/serenji/deltanji/Client.VCm.cls`)
            vscode.env.openExternal(deltanjiUri)
        }
    })

    context.subscriptions.push(deltanji) 
}



/* Given a serverId and a namespace, identify if the folder is already open
 * otherwise add it.
 *
 * Return folderId
 */
function addWorkspaceFolder(uri:vscode.Uri, name:string) {

    const workspaceFoldersLength = vscode.workspace.workspaceFolders.length        

    // Is the workspace folder we want already open?
    let folderId = workspaceFoldersLength
    for (let i = 0 ; i < workspaceFoldersLength ; i++) {
        const workspaceUri = vscode.workspace.workspaceFolders[i].uri
        if (uriEqual(workspaceUri, uri)) {
            folderId = i
            break
        }
    }

    // If no matching folder then add a new namespace specific one at the end
    // Can't add it at the beginning because it causes VS Code to reload the extension which breaks stuff
    if (folderId === workspaceFoldersLength) {
        const ok = vscode.workspace.updateWorkspaceFolders(folderId, 0, {uri: uri, name: name})
    }

    return folderId
}