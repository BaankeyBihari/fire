# CI/CD Pipeline Documentation

## Overview

This project uses GitHub Actions for Continuous Integration and Continuous Deployment, with automated testing, code coverage reporting via Codecov, and security auditing.

## Workflows

### Main CI/CD Pipeline (`.github/workflows/ci.yml`)

**Triggers:**

- Push to `main` or `develop` branches
- Pull requests targeting `main` or `develop` branches

**Jobs:**

#### 1. Test & Coverage

- **Node.js versions:** 20.x, 22.x (matrix strategy)
- **Steps:**
  1. Checkout code
  2. Setup Node.js with yarn cache
  3. Install dependencies (`yarn install --frozen-lockfile`)
  4. Run TypeScript checking (`yarn typecheck`)
  5. Run ESLint (`yarn lint`)
  6. Run tests with coverage (`yarn test:coverage`)
  7. Upload coverage to Codecov (Node.js 20.x only)
  8. Upload coverage artifacts

#### 2. Build Application

- **Depends on:** Test job completion
- **Steps:**
  1. Checkout code
  2. Setup Node.js 20.x
  3. Install dependencies
  4. Build Next.js application (`yarn build`)
  5. Upload build artifacts

#### 3. Security Audit

- **Runs in parallel with test job**
- **Steps:**
  1. Run `yarn audit --level moderate`
  2. Run dependency review (PR only)

## Code Coverage

### Codecov Integration

- **Service:** [Codecov](https://codecov.io/)
- **Configuration:** `codecov.yml`
- **Coverage targets:**
  - Project: 70% with 2% threshold
  - Patch: 60% with 5% threshold

### Jest Coverage Configuration

- **Coverage directory:** `coverage/`
- **Reporters:** text, lcov, json, html
- **Thresholds:**
  - Lines: 70%
  - Statements: 70%
  - Functions: 60%
  - Branches: 60%

### Excluded from coverage:

- Test files (`**/*.test.*`, `**/*.spec.*`)
- Test directories (`**/__tests__/**`)
- Next.js app files (`_app.tsx`, `_document.tsx`)
- Type definitions (`**/*.d.ts`)
- Configuration files

## Setup Instructions

### 1. Codecov Setup

1. Go to [codecov.io](https://codecov.io/)
2. Sign up/in with your GitHub account
3. Add your repository
4. Get your repository token
5. Add `CODECOV_TOKEN` to GitHub repository secrets:
   - Go to repository Settings → Secrets and variables → Actions
   - Click "New repository secret"
   - Name: `CODECOV_TOKEN`
   - Value: Your Codecov token

### 2. GitHub Repository Secrets

Required secrets:

- `CODECOV_TOKEN`: Your Codecov repository token

### 3. Branch Protection Rules (Recommended)

Set up branch protection for `main` branch:

1. Go to repository Settings → Branches
2. Add rule for `main` branch
3. Enable:
   - "Require a pull request before merging"
   - "Require status checks to pass before merging"
   - "Require branches to be up to date before merging"
   - Select: "Test & Coverage", "Build Application", "Security Audit"

## Local Development

### Running Tests with Coverage

```bash
# Run tests with coverage
yarn test:coverage

# Run tests in watch mode
yarn test:watch

# Run validation (same as pre-commit hook)
yarn validate
```

### Viewing Coverage Reports

After running `yarn test:coverage`:

- Open `coverage/lcov-report/index.html` in browser
- Or check terminal output for summary

## Workflow Features

### Performance Optimizations

- **Concurrency:** Cancels previous runs when new commits are pushed
- **Caching:** Uses yarn cache for faster dependency installation
- **Matrix Strategy:** Tests across multiple Node.js versions
- **Parallel Jobs:** Security audit runs in parallel with tests

### Artifact Management

- **Coverage reports:** Retained for 30 days
- **Build artifacts:** Retained for 7 days
- **Automatic cleanup:** Old artifacts are automatically removed

### Error Handling

- **Fail-safe:** Security audit continues on error
- **Coverage upload:** Doesn't fail CI if Codecov is unavailable
- **Verbose logging:** Detailed output for debugging

## Monitoring & Maintenance

### Coverage Trends

- Monitor coverage trends in Codecov dashboard
- Set up Codecov integrations for Slack/email notifications
- Review coverage comments on pull requests

### Performance Monitoring

- Monitor CI run times in GitHub Actions
- Review artifact storage usage
- Update Node.js versions in matrix as needed

### Dependencies

- Automated dependency review on pull requests
- Regular security audits
- Update action versions periodically

## Troubleshooting

### Common Issues

#### Coverage Upload Fails

- Check `CODECOV_TOKEN` secret is set correctly
- Verify Codecov repository is configured
- Check if `coverage/lcov.info` file exists

#### Tests Fail in CI but Pass Locally

- Check Node.js version compatibility
- Verify environment variables
- Check for timezone/locale differences

#### Build Fails

- Check TypeScript errors
- Verify all dependencies are in `package.json`
- Check for Next.js configuration issues

### Debug Commands

```bash
# Run same commands as CI locally
yarn install --frozen-lockfile
yarn typecheck
yarn lint
yarn test:coverage --testPathIgnorePatterns=useFileOperations.test.ts
yarn build

# Check audit issues
yarn audit --level moderate
```

## Integration with Git Hooks

The CI/CD pipeline complements local git hooks:

- **Pre-commit:** Local validation (typecheck, lint, test)
- **CI/CD:** Comprehensive testing across environments
- **Both:** Ensure code quality at multiple stages

This ensures code quality both locally and in the cloud, providing multiple layers of validation before code reaches production.
