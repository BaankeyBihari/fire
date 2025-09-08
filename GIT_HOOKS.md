# Git Hooks Documentation

This project uses [Husky](https://typicode.github.io/husky/) to manage Git hooks that ensure code quality and consistency.

## Pre-commit Hook

The pre-commit hook runs automatically before each commit and performs the following checks:

1. **TypeScript Type Checking** (`yarn typecheck`)
   - Ensures all TypeScript code compiles without errors
   - Checks type safety across the entire codebase

2. **ESLint** (`yarn lint`)
   - Enforces code style and quality rules
   - Catches potential bugs and code smells

3. **Unit Tests** (`yarn test`)
   - Runs the full test suite
   - Ensures no existing functionality is broken

If any of these checks fail, the commit will be blocked.

## Commit Message Hook

The commit-msg hook validates that commit messages follow the [Conventional Commits](https://www.conventionalcommits.org/) specification.

### Valid commit message format

```text
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Examples

```bash
feat: add user authentication
fix(api): resolve timeout issue in user service
docs: update installation instructions
test: add unit tests for calculator utils
```

### Commit types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only changes
- `style`: Code style changes (formatting, missing semi-colons, etc)
- `refactor`: Code change that neither fixes a bug nor adds a feature
- `perf`: Performance improvement
- `test`: Adding missing tests or correcting existing tests
- `build`: Changes affecting build system or external dependencies
- `ci`: Changes to CI configuration files and scripts
- `chore`: Other changes that don't modify src or test files
- `revert`: Reverts a previous commit

## Bypassing Hooks (Emergency Only)

In rare cases where you need to bypass the hooks:

```bash
# Skip pre-commit hook
git commit --no-verify -m "emergency fix"

# Skip both pre-commit and commit-msg hooks
git commit --no-verify --no-edit
```

**Note**: Use `--no-verify` sparingly and only in emergencies. The hooks are there to maintain code quality.

## Manual Hook Execution

You can run the hooks manually:

```bash
# Run all pre-commit checks
yarn validate

# Run individual checks
yarn typecheck
yarn lint
yarn test

# Test commit message format
echo "your commit message" | npx commitlint
```

## Hook Configuration Files

- `.husky/pre-commit`: Pre-commit hook script
- `.husky/commit-msg`: Commit message validation hook
- `.commitlintrc.json`: Commitlint configuration
- `package.json`: Contains hook-related scripts

## Troubleshooting

### Pre-commit hook fails

1. Check the specific error message
2. Run `yarn validate` to see detailed output
3. Fix the issues and try committing again

### Commit message rejected

1. Check that your message follows conventional format
2. Use `yarn commit` for interactive commit message creation
3. Refer to the commit types list above

### Hook not running

1. Ensure Husky is installed: `npx husky install`
2. Check hook permissions: `chmod +x .husky/pre-commit .husky/commit-msg`
3. Verify you're in a Git repository
