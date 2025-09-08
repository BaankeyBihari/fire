# CI/CD Setup Instructions

## Quick Setup

### 1. Codecov Integration

1. Visit [codecov.io](https://codecov.io/) and sign up with GitHub
2. Add your repository to Codecov
3. Copy your repository token
4. Add the token to GitHub Secrets:
   - Go to: Repository → Settings → Secrets and variables → Actions
   - Create new secret: `CODECOV_TOKEN`
   - Paste your Codecov token

### 2. Ready to Go! 🚀

Your CI/CD pipeline will now:

- ✅ Run tests on every push and PR
- ✅ Generate code coverage reports
- ✅ Upload coverage to Codecov
- ✅ Run security audits
- ✅ Build and verify your application

## Coverage Badge

Add this to your README.md:

```markdown
[![codecov](https://codecov.io/gh/BaankeyBihari/fire/branch/main/graph/badge.svg)](https://codecov.io/gh/BaankeyBihari/fire)
```

## Local Commands

```bash
# Test with coverage (same as CI)
yarn test:coverage

# Run all validation checks
yarn validate

# Build application
yarn build
```

## Files Created

- `.github/workflows/ci.yml` - Main CI/CD pipeline
- `codecov.yml` - Codecov configuration
- `CI_CD_SETUP.md` - Detailed documentation

## What Happens on Push/PR

1. **Tests** run on Node.js 20.x and 22.x
2. **TypeScript** checking
3. **ESLint** validation
4. **Coverage** generated and uploaded to Codecov
5. **Security audit** performed
6. **Application build** verified

All checks must pass before merging! 🛡️
