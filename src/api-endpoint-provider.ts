import * as vscode from "vscode";
import { getExtensionOptions } from "./options";
import { parseExportedFunctions } from "./export-parser/export-parser";
import { IPathResolver, NextjsPathResolver } from "./path-resolver";
import { getMessage } from "./i18n/i18n";

export class ApiEndpointCodeLensProvider implements vscode.CodeLensProvider {
    private _onDidChangeCodeLenses: vscode.EventEmitter<void> = new vscode.EventEmitter<void>();
    public readonly onDidChangeCodeLenses: vscode.Event<void> = this._onDidChangeCodeLenses.event;
    private pathResolver: IPathResolver;
  
    constructor(pathResolver?: IPathResolver) {
      vscode.workspace.onDidChangeConfiguration((_) => {
        this._onDidChangeCodeLenses.fire();
      });
      
      const activeEditor = vscode.window.activeTextEditor;
      const workspaceFolder = activeEditor ? vscode.workspace.getWorkspaceFolder(activeEditor.document.uri) : undefined;
      this.pathResolver = pathResolver || new NextjsPathResolver(workspaceFolder);
    }
  
    public provideCodeLenses(
      document: vscode.TextDocument,
      token: vscode.CancellationToken
    ): vscode.ProviderResult<vscode.CodeLens[]> {
      const codeLenses: vscode.CodeLens[] = [];
      const exportedFunctions = parseExportedFunctions(document.uri.fsPath);
  
      for (const exportedFunction of exportedFunctions) {
        const { name: method, line: lineIndex } = exportedFunction;
        const urlPath = this.pathResolver.resolveApiPath(document.uri);
        
        if (!urlPath) {
          continue;
        }

        const { hostUrl } = getExtensionOptions();
        const apiEndpoint = `${hostUrl}/${urlPath?.replace("/route.ts", "").replace('//', '/')}`;
        const range = document.lineAt(lineIndex - 1).range;
  
        codeLenses.push(
          new vscode.CodeLens(range, {
            title: `${method.toUpperCase()} ${urlPath}`,
            command: "extension.showEndpoint",
            arguments: [method, urlPath],
          })
        );
  
        codeLenses.push(
          new vscode.CodeLens(range, {
            title: getMessage("codelens.copyUrl"),
            command: "extension.copyEndpoint",
            arguments: [apiEndpoint],
          })
        );
      }
  
      return codeLenses;
    }
}