import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextjsPathResolver } from './path-resolver';

// Mock vscode module
vi.mock('vscode', () => ({
  Uri: {
    file: (path: string) => ({ fsPath: path }),
  },
}));

describe('NextjsPathResolver', () => {
  describe('resolvePagePath', () => {
    const createMockWorkspaceFolder = (fsPath: string) => ({
      uri: { fsPath },
      name: 'test-workspace',
      index: 0,
    });

    const createMockUri = (fsPath: string) => ({ fsPath });

    it('should return undefined when workspaceFolder is not provided', () => {
      const resolver = new NextjsPathResolver(undefined);
      const result = resolver.resolvePagePath(createMockUri('/any/path/page.tsx') as any);
      expect(result).toBeUndefined();
    });

    it('should return "/" for root page (app/page.tsx)', () => {
      const resolver = new NextjsPathResolver(createMockWorkspaceFolder('/project') as any);
      const result = resolver.resolvePagePath(createMockUri('/project/app/page.tsx') as any);
      expect(result).toBe('/');
    });

    it('should resolve basic path (app/dashboard/page.tsx -> /dashboard)', () => {
      const resolver = new NextjsPathResolver(createMockWorkspaceFolder('/project') as any);
      const result = resolver.resolvePagePath(createMockUri('/project/app/dashboard/page.tsx') as any);
      expect(result).toBe('/dashboard');
    });

    it('should resolve nested path (app/dashboard/users/page.tsx -> /dashboard/users)', () => {
      const resolver = new NextjsPathResolver(createMockWorkspaceFolder('/project') as any);
      const result = resolver.resolvePagePath(createMockUri('/project/app/dashboard/users/page.tsx') as any);
      expect(result).toBe('/dashboard/users');
    });

    it('should resolve dynamic route (app/users/[id]/page.tsx -> /users/[id])', () => {
      const resolver = new NextjsPathResolver(createMockWorkspaceFolder('/project') as any);
      const result = resolver.resolvePagePath(createMockUri('/project/app/users/[id]/page.tsx') as any);
      expect(result).toBe('/users/[id]');
    });

    it('should resolve catch-all route (app/[...slug]/page.tsx -> /[...slug])', () => {
      const resolver = new NextjsPathResolver(createMockWorkspaceFolder('/project') as any);
      const result = resolver.resolvePagePath(createMockUri('/project/app/[...slug]/page.tsx') as any);
      expect(result).toBe('/[...slug]');
    });

    it('should return undefined for non-App Router paths (pages/)', () => {
      const resolver = new NextjsPathResolver(createMockWorkspaceFolder('/project') as any);
      const result = resolver.resolvePagePath(createMockUri('/project/pages/about/page.tsx') as any);
      expect(result).toBeUndefined();
    });

    it('should handle src/app directory', () => {
      const resolver = new NextjsPathResolver(createMockWorkspaceFolder('/project') as any);
      const result = resolver.resolvePagePath(createMockUri('/project/src/app/dashboard/page.tsx') as any);
      expect(result).toBe('/dashboard');
    });

    it('should handle different file extensions (.ts, .jsx, .js)', () => {
      const resolver = new NextjsPathResolver(createMockWorkspaceFolder('/project') as any);

      expect(resolver.resolvePagePath(createMockUri('/project/app/about/page.ts') as any)).toBe('/about');
      expect(resolver.resolvePagePath(createMockUri('/project/app/about/page.jsx') as any)).toBe('/about');
      expect(resolver.resolvePagePath(createMockUri('/project/app/about/page.js') as any)).toBe('/about');
    });
  });

  describe('resolveApiPath', () => {
    const createMockWorkspaceFolder = (fsPath: string) => ({
      uri: { fsPath },
      name: 'test-workspace',
      index: 0,
    });

    const createMockUri = (fsPath: string) => ({ fsPath });

    it('should return undefined when workspaceFolder is not provided', () => {
      const resolver = new NextjsPathResolver(undefined);
      const result = resolver.resolveApiPath(createMockUri('/any/path/route.ts') as any);
      expect(result).toBeUndefined();
    });

    it('should resolve App Router API path (app/api/users/route.ts)', () => {
      const resolver = new NextjsPathResolver(createMockWorkspaceFolder('/project') as any);
      const result = resolver.resolveApiPath(createMockUri('/project/app/api/users/route.ts') as any);
      expect(result).toBe('api/users/route.ts');
    });

    it('should resolve Pages Router API path (pages/api/users.ts)', () => {
      const resolver = new NextjsPathResolver(createMockWorkspaceFolder('/project') as any);
      const result = resolver.resolveApiPath(createMockUri('/project/pages/api/users.ts') as any);
      expect(result).toBe('api/users.ts');
    });
  });
});
