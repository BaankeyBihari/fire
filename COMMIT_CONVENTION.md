# Commit Message Standards

This project uses [Commitizen](https://commitizen.github.io/cz-cli/) with [Conventional Commits](https://www.conventionalcommits.org/) to standardize commit messages.

## Usage

Instead of using `git commit`, use one of these commands:

```bash
# Using yarn script
yarn commit

# Or using the alias
yarn cz

# Or directly with npx
npx cz
```

## Commit Types

Commitizen will prompt you to select a commit type:

- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation only changes
- **style**: Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)
- **refactor**: A code change that neither fixes a bug nor adds a feature
- **perf**: A code change that improves performance
- **test**: Adding missing tests or correcting existing tests
- **build**: Changes that affect the build system or external dependencies
- **ci**: Changes to our CI configuration files and scripts
- **chore**: Other changes that don't modify src or test files
- **revert**: Reverts a previous commit

## Example

When you run `yarn commit`, you'll be prompted with questions like:

1. **Type of change**: Select from the list above
2. **Scope** (optional): What is the scope of this change (e.g., component, utils, hooks)?
3. **Short description**: Brief description of the change
4. **Longer description** (optional): More detailed explanation
5. **Breaking changes** (optional): List any breaking changes
6. **Issues closed** (optional): List any issues this commit closes

This will generate a commit message like:

```text
feat(hooks): add useDataProcessing hook for portfolio analytics

Added new hook to handle data transformation and processing
for portfolio calculations with memoization for performance.

Closes #123
```

## Benefits

- **Consistency**: All commit messages follow the same format
- **Automation**: Easy to generate changelogs and determine semantic versions
- **Clarity**: Clear understanding of what each commit does
- **Tooling**: Better integration with tools that parse commit messages
