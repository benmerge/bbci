# Planet Portfolio Prototype

This is the current local prototype for Planet Portfolio's two-sided experience:

- Consumer-facing habitat contribution site
- Merge ops-facing enrollment and activation concept

## Run locally

From this folder:

```bash
cd /Users/baimac/Documents/Playground/netlify-bbci
npm run dev
```

Then open:

- `http://localhost:4173`

## Deploy to Vercel

To deploy this prototype to Vercel:

1. **CLI**: Run `npx vercel` from this folder.
2. **Git**: Push to GitHub and connect the repository in the Vercel dashboard.

Vercel will automatically detect the `vercel.json` configuration and serve the project as a static site with clean URLs.

## Current state

Right now this is a static prototype intended to help us iterate quickly on:

- information architecture
- landing page messaging
- consumer contribution flows
- Merge ops workflows for intake, review, and activation

## What comes next

We should evolve this in four steps:

1. Introduce structured data for farms, habitat projects, listings, and campaigns.
2. Add an ops-side admin surface for intake, review, and publish states.
3. Add a functional backend and API so public listings come from data instead of hardcoded HTML.
4. Add contribution/event tracking and reporting between consumer actions and ops reporting.

## Recommended product model

Core entities:

- `farm`
- `habitat_project`
- `listing`
- `campaign`
- `brand_channel`
- `contribution_event`
- `listing_status`

Suggested listing lifecycle:

- `draft`
- `review`
- `active`
- `paused`
- `archived`

## Suggested backend direction

For speed and flexibility, the next build should likely use:

- frontend: `Next.js` or `Vite + React`
- backend: `Supabase` or `Postgres + lightweight API`
- auth: simple email auth for Merge ops users
- admin: internal ops dashboard in the same codebase

That gives us:

- public consumer site
- protected ops dashboard
- shared database
- fast iteration with Codex

## Working style with Codex

As we iterate, a good loop is:

1. Run the prototype locally.
2. Tell Codex what to change.
3. Refresh and review together.
4. Once the front-end direction feels right, begin replacing static sections with real data and admin workflows.
