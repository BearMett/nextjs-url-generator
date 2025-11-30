import path from 'path';
import fs from 'fs';
import { parsePageDefaultExport, isPageFile, isAppRouterPageFile } from './page-parser';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('page-parser', () => {
  const testDir = path.join(__dirname, 'test-temp');
  
  beforeEach(() => {
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }
  });

  afterEach(() => {
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true });
    }
  });

  describe('parsePageDefaultExport', () => {
    it('should parse default function declaration', () => {
      const testContent = `
export default function HomePage() {
  return <div>Home</div>;
}
`;
      const testFile = path.join(testDir, 'page.tsx');
      fs.writeFileSync(testFile, testContent);

      const result = parsePageDefaultExport(testFile);
      expect(result).toEqual({ name: 'HomePage', line: 2 });
    });

    it('should parse default arrow function', () => {
      const testContent = `
export default () => {
  return <div>Home</div>;
}
`;
      const testFile = path.join(testDir, 'page.tsx');
      fs.writeFileSync(testFile, testContent);

      const result = parsePageDefaultExport(testFile);
      expect(result).toEqual({ name: 'Page', line: 2 });
    });

    it('should parse default export with variable', () => {
      const testContent = `
const HomePage = () => {
  return <div>Home</div>;
}

export default HomePage;
`;
      const testFile = path.join(testDir, 'page.tsx');
      fs.writeFileSync(testFile, testContent);

      const result = parsePageDefaultExport(testFile);
      expect(result).toEqual({ name: 'HomePage', line: 6 });
    });

    it('should return null for invalid files', () => {
      const testFile = path.join(testDir, 'invalid.txt');
      fs.writeFileSync(testFile, 'not a javascript file');

      const result = parsePageDefaultExport(testFile);
      expect(result).toBeNull();
    });

    it('should return null when no default export found', () => {
      const testContent = `
export function HomePage() {
  return <div>Home</div>;
}
`;
      const testFile = path.join(testDir, 'page.tsx');
      fs.writeFileSync(testFile, testContent);

      const result = parsePageDefaultExport(testFile);
      expect(result).toBeNull();
    });
  });

  describe('isPageFile', () => {
    it('should return true for page files', () => {
      expect(isPageFile('/app/page.tsx')).toBe(true);
      expect(isPageFile('/app/dashboard/page.ts')).toBe(true);
      expect(isPageFile('/app/users/page.jsx')).toBe(true);
      expect(isPageFile('/app/settings/page.js')).toBe(true);
    });

    it('should return false for non-page files', () => {
      expect(isPageFile('/app/route.tsx')).toBe(false);
      expect(isPageFile('/app/layout.tsx')).toBe(false);
      expect(isPageFile('/app/component.tsx')).toBe(false);
      expect(isPageFile('/app/loading.tsx')).toBe(false);
    });
  });

  describe('isAppRouterPageFile', () => {
    it('should return true for App Router page files', () => {
      expect(isAppRouterPageFile('/src/app/page.tsx')).toBe(true);
      expect(isAppRouterPageFile('/app/dashboard/page.ts')).toBe(true);
      expect(isAppRouterPageFile('/project/app/users/page.jsx')).toBe(true);
    });

    it('should return false for non-App Router files', () => {
      expect(isAppRouterPageFile('/pages/index.tsx')).toBe(false);
      expect(isAppRouterPageFile('/src/pages/page.tsx')).toBe(false);
      expect(isAppRouterPageFile('/components/page.tsx')).toBe(false);
      expect(isAppRouterPageFile('/app/route.tsx')).toBe(false);
    });
  });
});