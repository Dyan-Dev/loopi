# Contributing to Loopi

Thanks for your interest in contributing! This project welcomes contributions from everyone — issues, pull requests, documentation improvements, tests, and examples are all appreciated.

How to contribute

- Fork the repository and create a feature branch: `git checkout -b feature/my-change`
- Make small, focused commits with clear messages
- Add tests where possible and update docs/examples
- Run linters and TypeScript checks before submitting

Opening issues

- Search existing issues before opening a new one
- Provide a clear title and a short description of the problem
- Include reproduction steps, relevant log output, and screenshots when helpful

Pull requests

- Base your PR on `main` (or the branch described in the repo's contributing guidelines)
- Keep PRs small and focused
- Include a concise description of what problem the PR solves
- Reference related issues with `Fixes #<issue>` when appropriate

Code style

- The project uses TypeScript and follows a consistent style (run `npm run lint` locally)
- Keep changes idiomatic and focused; avoid unrelated refactors in the same PR

Community

- Be respectful and patient — maintainers are volunteers
- Expect constructive feedback and iterate on your PR

Thank you for contributing — your work makes Loopi better for everyone!

## Getting Help

If you need help or have questions about contributing:
- **Email**: support@dyan.live
- **GitHub Discussions**: Start a discussion in the repository
- **Issues**: Search existing issues or create a new one

## Developer Notes

- **Tailwind / PostCSS**: The renderer UI uses Tailwind CSS processed via PostCSS. The canonical PostCSS config is `postcss.config.cjs` (CommonJS). There is also a small ESM re-export `postcss.config.js` present so tooling that expects ESM can still read the configuration. If you update Tailwind or PostCSS plugins, update `tailwind.config.cjs` `content` globs so utilities are generated.

- **Formatting & Linting (Biome)**: We use Biome for formatting and linting. Run the formatter/linter before committing with:

```bash
pnpm format
```

Enable the Biome VS Code extension for on-save formatting where available.