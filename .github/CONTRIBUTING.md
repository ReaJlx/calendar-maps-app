# Contributing to Calendar Maps App

We welcome contributions! This document outlines guidelines for contributing to the project.

## Getting Started

1. **Fork the repository**
2. **Clone your fork**: `git clone https://github.com/YOUR_USERNAME/calendar-maps-app`
3. **Create a branch**: `git checkout -b feature/your-feature`
4. **Make changes** and commit with clear messages
5. **Push to your fork** and create a Pull Request

## Development Setup

```bash
# Install dependencies
npm install

# Create .env.local
cp .env.example .env.local
# Fill in your Google Cloud credentials

# Start development server
npm run dev

# Run tests
npm run test

# Run linting
npm run lint
```

## Code Standards

### TypeScript
- Strict mode enabled
- No `any` types (use `unknown` if necessary)
- All functions typed
- Export types for public APIs

### Formatting
- Use Prettier (auto-formatted on commit)
- Max line length: 100 characters
- 2-space indentation
- Semicolons required

### Naming Conventions
- `components/`: PascalCase (MyComponent.tsx)
- `lib/`: camelCase (myService.ts)
- `api/`: lowercase with hyphens (my-route.ts)
- Constants: UPPER_SNAKE_CASE
- Interfaces: IMyInterface (optional prefix)

### Comments
- Comment complex logic
- Use JSDoc for public APIs
- Keep comments up-to-date with code

## Testing

### Unit Tests
```bash
npm run test
```

### Integration Tests
```bash
npm run test:integration
```

### E2E Tests
```bash
npm run test:e2e
```

### Coverage
```bash
npm run test -- --coverage
```

## Pull Request Process

1. **Update tests** for new features
2. **Update documentation** for API changes
3. **Run all checks**: `npm run lint && npm run test`
4. **Create descriptive PR** with context
5. **Link related issues** using #issue-number
6. **Request review** from maintainers
7. **Address feedback** and update as needed

## PR Title Format
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `style:` Formatting
- `refactor:` Code restructuring
- `test:` Test additions
- `chore:` Maintenance

Example: `feat: add event search by location`

## Commit Message Format

```
<type>(<scope>): <subject>

<body>

Fixes #123
```

- `type`: feat, fix, docs, style, refactor, test, chore
- `scope`: component/feature (optional)
- `subject`: lowercase, no period, imperative mood
- `body`: explain what and why (wrap at 72 chars)

## Bug Reports

**Title:** `[BUG] Brief description`

**Description:**
- Steps to reproduce
- Expected behavior
- Actual behavior
- Screenshots (if applicable)
- Environment (browser, OS, version)

## Feature Requests

**Title:** `[FEATURE] Brief description`

**Description:**
- Use case
- Benefits
- Proposed solution
- Alternative solutions

## Community Guidelines

- Be respectful and inclusive
- Assume good intent
- Listen and learn from others
- Give credit and recognition
- Help others learn and grow

## Resources

- [Google Calendar API Docs](https://developers.google.com/calendar/api)
- [Google Maps API Docs](https://developers.google.com/maps)
- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## Questions?

- Check existing issues/discussions
- Ask in our Discord community
- Email maintainers
- Comment on related PR/issues

---

Thank you for contributing! 🎉
