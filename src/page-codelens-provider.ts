import * as vscode from "vscode";
import { getExtensionOptions } from "./options";
import { parsePageDefaultExport, isAppRouterPageFile } from "./page-parser/page-parser";
import { IPathResolver, NextjsPathResolver } from "./path-resolver";
import { getMessage } from "./i18n/i18n";

export class PageCodeLensProvider implements vscode.CodeLensProvider {
    private _onDidChangeCodeLenses: vscode.EventEmitter<void> = new vscode.EventEmitter<void>();
    public readonly onDidChangeCodeLenses: vscode.Event<void> = this._onDidChangeCodeLenses.event;
    private pathResolverOverride?: IPathResolver;

    constructor(pathResolver?: IPathResolver) {
        vscode.workspace.onDidChangeConfiguration((_) => {
            this._onDidChangeCodeLenses.fire();
        });

        // Store override for testing purposes only
        this.pathResolverOverride = pathResolver;
    }

    private getPathResolver(document: vscode.TextDocument): IPathResolver {
        if (this.pathResolverOverride) {
            return this.pathResolverOverride;
        }
        const workspaceFolder = vscode.workspace.getWorkspaceFolder(document.uri);
        return new NextjsPathResolver(workspaceFolder);
    }

    public provideCodeLenses(
        document: vscode.TextDocument,
        token: vscode.CancellationToken
    ): vscode.ProviderResult<vscode.CodeLens[]> {
        const codeLenses: vscode.CodeLens[] = [];

        // Only process App Router page files
        if (!isAppRouterPageFile(document.uri.fsPath)) {
            return codeLenses;
        }

        const defaultExport = parsePageDefaultExport(document.uri.fsPath);

        if (!defaultExport) {
            return codeLenses;
        }

        const pathResolver = this.getPathResolver(document);
        const urlPath = pathResolver.resolvePagePath(document.uri);
        
        if (!urlPath) {
            console.error('[PageCodeLensProvider] Failed to resolve page path for:', document.uri.fsPath);
            return codeLenses;
        }

        const { hostUrl } = getExtensionOptions();
        const pageUrl = `${hostUrl}${urlPath}`;
        const range = document.lineAt(Math.max(0, defaultExport.line - 1)).range;

        // Add page path CodeLens
        codeLenses.push(
            new vscode.CodeLens(range, {
                title: `PAGE ${urlPath}`,
                command: "extension.showPageUrl",
                arguments: [urlPath],
            })
        );

        // Add page URL copy CodeLens
        codeLenses.push(
            new vscode.CodeLens(range, {
                title: getMessage("codelens.copyUrl"),
                command: "extension.copyPageUrl",
                arguments: [pageUrl],
            })
        );

        return codeLenses;
    }
}