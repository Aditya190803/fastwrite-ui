# Contributing to FastWrite UI

Thank you for your interest in contributing to FastWrite! This document provides guidelines and instructions for contributing.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Making Changes](#making-changes)
- [Code Style](#code-style)
- [Testing](#testing)
- [Submitting Changes](#submitting-changes)
- [Reporting Bugs](#reporting-bugs)
- [Feature Requests](#feature-requests)

## Code of Conduct

Please be respectful and constructive in all interactions. We welcome contributors from all backgrounds.

## Getting Started

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/fastwrite-ui.git
   cd fastwrite-ui
   ```
3. Add the upstream repository:
   ```bash
   git remote add upstream https://github.com/original/fastwrite-ui.git
   ```

## Development Setup

### Prerequisites

- [Bun](https://bun.sh/) v1.0 or later
- Node.js v18+ (optional, for compatibility)
- Git

### Installation

```bash
# Install dependencies
bun install

# Start development server
bun run dev

# Run tests
bun run test

# Build for production
bun run build
```

### Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `https://fastwrite-api.onrender.com` |
| `VITE_API_TIMEOUT` | API request timeout (ms) | `300000` |

## Project Structure

```
src/
├── components/         # React components
│   ├── results/       # Results page components
│   ├── shared/        # Shared/common components
│   └── ui/            # UI primitives (shadcn/ui)
├── hooks/             # Custom React hooks
├── lib/               # Utilities and helpers
│   ├── constants.ts   # Centralized constants
│   ├── prompts.ts     # Prompt generation
│   ├── documentation.ts # Documentation utilities
│   └── utils.ts       # General utilities
├── pages/             # Page components
├── types/             # TypeScript types
└── test/              # Test setup and utilities
```

## Making Changes

### Branch Naming

- `feature/` - New features (e.g., `feature/dark-mode`)
- `fix/` - Bug fixes (e.g., `fix/confetti-loop`)
- `docs/` - Documentation changes
- `refactor/` - Code refactoring
- `test/` - Adding/updating tests

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): description

[optional body]

[optional footer]
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

Examples:
- `feat(export): add HTML export option`
- `fix(confetti): prevent confetti on every page load`
- `docs(readme): add troubleshooting section`

## Code Style

### TypeScript

- Use TypeScript for all new code
- Enable strict mode
- Prefer interfaces over type aliases for objects
- Use `const` assertions where applicable

### React

- Use functional components with hooks
- Prefer named exports
- Keep components focused and single-responsibility
- Use React.memo() for expensive components

### CSS/Styling

- Use Tailwind CSS utility classes
- Follow dark mode patterns: `bg-white dark:bg-slate-800`
- Use CSS variables for theme colors
- Prefer responsive classes over media queries

### File Organization

- One component per file
- Co-locate tests with source files (`*.test.ts`)
- Keep files under 300 lines when possible

## Testing

### Running Tests

```bash
# Run all tests
bun run test

# Run tests in watch mode
bun run test

# Run tests once
bun run test:run

# Run with coverage
bun run test:coverage
```

### Writing Tests

- Test files should be named `*.test.ts` or `*.test.tsx`
- Place tests next to the source files
- Use descriptive test names
- Test edge cases and error states

Example:
```typescript
import { describe, it, expect } from 'vitest';
import { myFunction } from './myModule';

describe('myFunction', () => {
  it('should handle normal input', () => {
    expect(myFunction('input')).toBe('expected');
  });

  it('should handle edge cases', () => {
    expect(myFunction('')).toBe('');
  });
});
```

## Submitting Changes

### Pull Request Process

1. Update your fork with the latest upstream changes:
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. Create a feature branch:
   ```bash
   git checkout -b feature/your-feature
   ```

3. Make your changes and commit

4. Push to your fork:
   ```bash
   git push origin feature/your-feature
   ```

5. Open a Pull Request against the `main` branch

### PR Checklist

- [ ] Code follows the style guidelines
- [ ] Tests added/updated for new functionality
- [ ] All tests pass (`bun run test:run`)
- [ ] Linting passes (`bun run lint`)
- [ ] Build succeeds (`bun run build`)
- [ ] Documentation updated if needed
- [ ] PR title follows commit conventions

## Reporting Bugs

### Before Submitting

1. Check existing issues for duplicates
2. Try reproducing in the latest version
3. Gather relevant information

### Bug Report Template

```markdown
**Describe the bug**
A clear description of what the bug is.

**To Reproduce**
1. Go to '...'
2. Click on '...'
3. See error

**Expected behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots.

**Environment:**
- OS: [e.g., macOS 14.0]
- Browser: [e.g., Chrome 120]
- Version: [e.g., 1.0.0]
```

## Feature Requests

### Suggesting Features

1. Check if the feature already exists or is planned
2. Open an issue with the `enhancement` label
3. Describe the use case and expected behavior
4. Be open to discussion and iteration

### Feature Request Template

```markdown
**Is your feature request related to a problem?**
A clear description of the problem.

**Describe the solution you'd like**
A clear description of what you want to happen.

**Describe alternatives you've considered**
Alternative solutions or features you've considered.

**Additional context**
Add any other context or screenshots.
```

## Questions?

- Open a [Discussion](https://github.com/original/fastwrite-ui/discussions)
- Check existing documentation
- Review closed issues for similar questions

Thank you for contributing! 🎉
