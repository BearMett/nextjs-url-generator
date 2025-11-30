import * as vscode from "vscode";
import { ApiEndpointCodeLensProvider } from "./api-endpoint-provider";
import { PageCodeLensProvider } from "./page-codelens-provider";
import { getMessage } from "./i18n/i18n";

// Supported languages for CodeLens providers
const SUPPORTED_LANGUAGES: vscode.DocumentSelector = [
  { scheme: "file", language: "typescript" }, 
  { scheme: "file", language: "javascript" },
  { scheme: "file", language: "typescriptreact" },
  { scheme: "file", language: "javascriptreact" }
];

export function activate(context: vscode.ExtensionContext) {
  // Register API endpoint CodeLens provider
  context.subscriptions.push(
    vscode.languages.registerCodeLensProvider(
      SUPPORTED_LANGUAGES,
      new ApiEndpointCodeLensProvider()
    )
  );

  // Register page CodeLens provider
  context.subscriptions.push(
    vscode.languages.registerCodeLensProvider(
      SUPPORTED_LANGUAGES,
      new PageCodeLensProvider()
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "extension.showEndpoint",
      async (method: string, path: string) => {
        await vscode.env.clipboard.writeText(`${method.toUpperCase()} ${path}`);
        vscode.window.showInformationMessage(getMessage("extension.showEndpoint"));
      }
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "extension.copyEndpoint",
      async (endpoint: string) => {
        await vscode.env.clipboard.writeText(endpoint);
        vscode.window.showInformationMessage(getMessage("extension.copyEndpoint"));
      }
    )
  );

  // Register page URL commands
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "extension.showPageUrl",
      async (path: string) => {
        await vscode.env.clipboard.writeText(`PAGE ${path}`);
        vscode.window.showInformationMessage(getMessage("extension.showPageUrl"));
      }
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "extension.copyPageUrl",
      async (pageUrl: string) => {
        await vscode.env.clipboard.writeText(pageUrl);
        vscode.window.showInformationMessage(getMessage("extension.copyPageUrl"));
      }
    )
  );
}

export function deactivate() {}
