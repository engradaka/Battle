# Changelog

All notable changes to this project will be documented in this file.

## [1.0.0] - 2026-02-20

### Security Fixes
- ✅ Updated Next.js from 15.2.8 to 15.4.5 (fixes CVE for image optimization)
- ✅ Implemented server-side authentication in middleware
- ✅ Added security headers (X-Frame-Options, CSP, etc.)
- ✅ Added Permissions-Policy header

### Configuration Improvements
- ✅ Pinned all "latest" dependencies to specific versions
- ✅ Removed conflicting next.config.js (kept next.config.mjs)
- ✅ Fixed Next.js config to use remotePatterns for images
- ✅ Re-enabled TypeScript and ESLint checks during builds
- ✅ Created .env.example template
- ✅ Updated .gitignore to exclude sensitive files

### Code Quality
- ✅ Added global error boundary (app/global-error.tsx)
- ✅ Added page-level error boundary (app/error.tsx)
- ✅ Added ESLint configuration
- ✅ Added Prettier configuration
- ✅ Added VS Code workspace settings

### Documentation
- ✅ Created comprehensive SETUP.md
- ✅ Created DATABASE_SETUP.md for clear migration path
- ✅ Created SECURITY.md with security policies
- ✅ Updated README.md with better structure
- ✅ Added CHANGELOG.md

### Known Issues
- ⚠️ xlsx package has known vulnerabilities (no fix available)
  - Mitigated by restricting to admin-only uploads
  - Using latest available version from CDN
- ⚠️ minimatch/glob vulnerabilities in dev dependencies
  - Does not affect production builds

### Breaking Changes
- Environment variables are now required (see .env.example)
- Server-side auth will redirect unauthenticated users
- TypeScript errors will now fail builds (as they should)

### Migration Guide
1. Copy .env.example to .env.local
2. Fill in your Supabase credentials
3. Run `npm install` to update dependencies
4. Test authentication flow
5. Deploy with new environment variables

## [0.1.0] - Previous

Initial development version with various issues documented in inspection report.
