# RepoForYou

RepoForYou helps developers discover active open-source repositories that match
their stack, build a personal watchlist, and monitor new GitHub issues without
jumping between dozens of repository pages.

## What it does

- Browse a curated repository catalog by language, framework, and ecosystem.
- Combine tags with AND filtering, such as `Python + YC`.
- Search beyond the curated catalog using GitHub's public repository search.
- Watch any listed repository and review its newest open issues.
- Run an on-demand, explainable repository health check using live GitHub data.
- See remaining GitHub API quota, reset timing, and request-cost guidance.
- Save watched repositories and settings in the current browser.
- Paginate curated and live GitHub search results.
- Follow a practical contribution guide before starting work.
- Learn how to create a minimal fine-grained GitHub token.

## GitHub token

A GitHub token is optional. Public repository discovery works without one, but
authenticated API requests receive higher general rate limits.

Use a fine-grained, expiring token and do not grant additional permissions for
public repository discovery. RepoForYou currently stores the token unencrypted
in the browser's `localStorage`, so do not use this feature on a shared device.
Never commit, publish, record, or share the token. Revoke it immediately if it
is exposed.

## Tech stack

- React 19
- TypeScript
- Tailwind CSS 4
- Next.js-compatible App Router
- vinext and Vite
- Cloudflare Workers runtime
- GitHub REST API

## Local development

### Requirements

- Node.js 22.13 or newer
- npm

### Setup

```bash
git clone https://github.com/ZoroZoro95/RepoForYou.git
cd RepoForYou
npm install
npm run dev
```

Open the local URL printed in the terminal.

## Commands

```bash
npm run dev      # Start the local development server
npm run lint     # Run ESLint
npm test         # Build the app and run rendered HTML tests
npm run build    # Create a production build
npm run start    # Run the production build locally
```

## How repository discovery works

The curated catalog is stored in the application and provides opinionated
stack and ecosystem tags. Selecting multiple tags requires every selected tag
to match.

The **All GitHub** search sends the query to GitHub's repository search API.
Those results are live rather than hardcoded and can be added to the same local
watchlist.

The issue watcher polls GitHub from the browser. It is not a webhook-backed
notification system, so updates are periodic rather than instant.

Repository health checks are also performed in the browser and use current
repository metadata plus the latest 20 closed pull requests. The score exposes
its four components: recent development, merged-PR momentum, issue-load
pressure, and community activity. It is a screening signal, not an assessment
of maintainer quality or project governance.

The API budget panel reads GitHub's response headers after each request and
tracks core and search quotas separately. Issue polling keeps successful
repository results when another watched repository fails, and rate-limit errors
include GitHub's retry or reset time when available.

## Data and privacy

RepoForYou does not currently require an account or run its own user database.
Watched repositories, the optional GitHub token, and related preferences are
stored in the current browser's `localStorage`. Clearing site data removes
them.

## Contributing

Before opening a pull request:

1. Confirm the problem still exists on the current default branch.
2. Read the repository instructions and existing issue discussion.
3. Keep the proposed change narrowly scoped.
4. Add or update tests for behavior changes.
5. Run `npm run lint` and `npm test`.
6. Explain the problem, root cause, solution, and verification in the pull request.

## Current limitations

- GitHub API rate limits still apply, including stricter search limits.
- Repository health scores are directional and depend on limited public GitHub data.
- Browser polling is not an instant notification system.
- Browser storage does not synchronize across devices.
- The optional token is stored unencrypted in `localStorage`.
- Repository recommendations are not yet generated from a user profile.

## License

No license has been added yet. Until one is added, the source is publicly
visible but should not be treated as open-source licensed code.
