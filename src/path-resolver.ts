import * as path from 'path';
import * as vscode from 'vscode';

export interface IPathResolver {
    resolveApiPath(documentUri: vscode.Uri): string | undefined;
    resolvePagePath(documentUri: vscode.Uri): string | undefined;
}

export class NextjsPathResolver implements IPathResolver {
    constructor(private workspaceFolder?: vscode.WorkspaceFolder) {}

    resolveApiPath(documentUri: vscode.Uri): string | undefined {
        if (!this.workspaceFolder) {
            return undefined;
        }

        const fullPath = documentUri.fsPath;
        const relativePath = path.relative(this.workspaceFolder.uri.fsPath, fullPath);
        
        let urlPath = "";
        if (relativePath.includes("app/")) {
            urlPath = relativePath.split("app/")[1];
        } else if (relativePath.includes("pages/")) {
            urlPath = relativePath.split("pages/")[1];
        }

        return urlPath || undefined;
    }

    resolvePagePath(documentUri: vscode.Uri): string | undefined {
        if (!this.workspaceFolder) {
            return undefined;
        }

        const fullPath = documentUri.fsPath;
        const relativePath = path.relative(this.workspaceFolder.uri.fsPath, fullPath);
        
        // Only work with App Router (app/ directory)
        if (!relativePath.includes("app/")) {
            return undefined;
        }

        const appPath = relativePath.split("app/")[1];
        
        // Remove page.tsx, page.ts, page.jsx, page.js from the end
        const pathWithoutPageFile = appPath.replace(/\/page\.(tsx?|jsx?)$/, '');
        
        // Handle root page (app/page.tsx -> /)
        if (pathWithoutPageFile === '' || pathWithoutPageFile.match(/^page\.(tsx?|jsx?)$/)) {
            return '/';
        }
        
        // Return the path with leading slash
        return `/${pathWithoutPageFile}`;
    }
}

// 테스트를 위한 mock resolver
export class MockPathResolver implements IPathResolver {
    constructor(private mockApiPath: string, private mockPagePath?: string) {}

    resolveApiPath(_documentUri: vscode.Uri): string {
        return this.mockApiPath;
    }

    resolvePagePath(_documentUri: vscode.Uri): string | undefined {
        return this.mockPagePath;
    }
}