import fs from "fs";
import * as parser from '@babel/parser';
import traverse from "@babel/traverse";

interface PageExport {
  name: string;
  line: number;
}

class PageParsedStore {
  private defaultExport: PageExport | null = null;

  public setDefaultExport(name: string, line: number) {
    if (this.defaultExport) {
      return; // Only store the first default export found
    }
    this.defaultExport = { name, line };
  }

  public getDefaultExport(): PageExport | null {
    return this.defaultExport;
  }
}

export function parsePageDefaultExport(filePath: string): PageExport | null {
  const parsedStore = new PageParsedStore();
  
  try {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const ast = parser.parse(fileContent, {
      sourceType: "module",
      plugins: ["typescript", "jsx"],
    });

    traverse(ast, {
      // Handle default function declarations: export default function Page() {}
      ExportDefaultDeclaration(path) {
        if (path.node.declaration.type === "FunctionDeclaration") {
          const functionName = path.node.declaration.id?.name || "Page";
          const line = path.node.declaration.loc?.start?.line ?? path.node.loc?.start?.line ?? 0;
          parsedStore.setDefaultExport(functionName, line);
        }
        // Handle default arrow functions: export default () => {}
        else if (path.node.declaration.type === "ArrowFunctionExpression") {
          const line = path.node.declaration.loc?.start?.line ?? path.node.loc?.start?.line ?? 0;
          parsedStore.setDefaultExport("Page", line);
        }
        // Handle default variable declarations: const Page = () => {}; export default Page;
        else if (path.node.declaration.type === "Identifier") {
          const line = path.node.loc?.start?.line ?? 0;
          parsedStore.setDefaultExport(path.node.declaration.name, line);
        }
      },

      // Handle export default at the end: const Page = () => {}; export default Page;
      ExportNamedDeclaration(path) {
        // This handles cases where default export is done separately
        if (path.node.source === null && path.node.specifiers) {
          path.node.specifiers.forEach((specifier) => {
            if (specifier.type === "ExportDefaultSpecifier") {
              const line = specifier.loc?.start?.line ?? 0;
              parsedStore.setDefaultExport(specifier.exported.name, line);
            }
          });
        }
      }
    });

    return parsedStore.getDefaultExport();
  } catch (error) {
    // If parsing fails, return null (file might not be a valid JS/TS file)
    return null;
  }
}

export function isPageFile(filePath: string): boolean {
  const fileName = filePath.split('/').pop() || '';
  return /^page\.(tsx?|jsx?)$/.test(fileName);
}

export function isAppRouterPageFile(filePath: string): boolean {
  return isPageFile(filePath) && filePath.includes('/app/');
}