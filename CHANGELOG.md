# Changelog

## [Unreleased]

### Fixed
- Production deployment workflow now correctly handles database migrations
- Added `DATABASE_URL` secret to GitHub repository secrets
- Modified `db-migration-manager.js` to use `prisma db push --accept-data-loss` for production deployments
- Added environment variable handling in multiple places to ensure proper deployment

## [1.0.0] - 2025-03-02

### Added
- Initial release of the CCC Landing Page
- Database migration strategy using Neon branching
- Preview deployments for pull requests
- Production deployment workflow 