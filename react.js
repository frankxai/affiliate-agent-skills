// Root-level subpath shim for `import ... from '@agentic-income/engine/react'`.
// Deliberately NOT using package.json "exports" for this subpath — Next.js's bundler
// (as of Next 16, verified 2026-07-06) fails to resolve conditional subpath exports for
// this package when it's consumed via a pnpm "link:" symlink, even with transpilePackages
// set. The plain legacy resolution algorithm (package root + matching filename, no exports
// field mediating it) does not hit that bug, so this file exists purely to keep the import
// path clean while avoiding the broken code path. Re-verify this shim is still needed if
// this package is ever installed as a real git/npm dependency instead of a local link.
export * from './dist/react/index.js';
