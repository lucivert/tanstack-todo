# tanstack-todo

A public TanStack Start to-do application built with file-based TanStack Router routes, typed server functions, and TanStack DB localStorage persistence. The app is intentionally structured so the local-only store can be replaced later with a hosted database implementation without changing route or component contracts.

## Purpose

This project demonstrates a maintainable TanStack Start application for managing todos with:

- local-first persistence today
- a clear server-function contract boundary for future hosted data access
- validated URL search params for search and status filtering
- shell-first SSR with client hydration for localStorage-backed data
- inline editing instead of a separate detail route

## Features

- Create, list, update, and delete todos
- Todo model with `id`, `description`, `status`, `createdAt`, and `updatedAt`
- Status options: `to-do`, `in-progress`, `done`
- Debounced free-text search reflected in the URL
- Immediate status filtering reflected in the URL
- Typed server functions used as the mandatory app interface
- TanStack DB localStorage collection persistence
- Accessible inline editing and empty/loading states
- Vitest coverage for contracts, repository behavior, filtering, timestamps, invalid input, and debounced search

## Project structure

```text
src/
  components/todos/       UI building blocks for filters, create form, and inline editing
  lib/todos/
    client.ts             Client query/mutation wrappers used by routes/components
    collection.ts         TanStack DB localStorage collection setup
    contracts.ts          Shared validation, normalization, filtering, and error helpers
    repository.ts         Explicit repository seam for persistence operations
    schema.ts             Reusable Zod schemas and TypeScript types
    server-functions.ts   Typed TanStack Start server functions for reads and mutations
  routes/
    __root.tsx            Document shell and streaming-friendly app chrome
    index.tsx             Todo route with validated search params and shell-first hydration
  test/
    setup.ts              Vitest setup
```

## Architecture

### Application model

The route and component layer never talks to localStorage directly. All application operations go through typed wrappers in `src/lib/todos/client.ts`, which call TanStack Start server functions for validation/normalization and then apply the validated result through the repository seam.

### Repository seam

`TodoRepository` is the explicit boundary between the UI/application model and persistence:

- `collection.ts` creates the current TanStack DB localStorage-backed collection.
- `repository.ts` adapts that collection to the `TodoRepository` contract.
- `server-functions.ts` defines the app-facing server contracts.

That means a future hosted database implementation can replace the repository behavior without changing route/component contracts.

### Shell-first SSR and hydration

The document shell renders on the server via `src/routes/__root.tsx`. The index route validates search params in a loader, but localStorage-backed todo data waits until client hydration before rendering the live list. During that gap, the route shows a skeleton state to avoid SSR/client mismatches.

## Local development

### Requirements

- Node.js 20+
- npm 10+

### Install

```bash
npm install
```

### Start the development server

```bash
npm run dev
```

The app runs on <http://localhost:3000> by default.

## Testing and quality checks

Run the targeted quality commands locally:

```bash
npm run test
npm run typecheck
npm run lint
npm run build
```

For watch mode during local development:

```bash
npm run test:watch
```

## Usage

1. Add a todo from the create form.
2. Edit todos inline with the **Edit** button.
3. Change a todo status between `to-do`, `in-progress`, and `done`.
4. Use the search field to filter by description text.
5. Use the status selector to filter instantly.
6. Copy/share the URL to preserve the current search and status state.

## Validation rules

- Todo descriptions must be non-empty after trimming on create and update.
- `createdAt` is preserved during updates.
- `updatedAt` changes on successful updates.
- Invalid statuses fail validation through shared schemas.
- Missing or blank todo ids are rejected with clear errors.

## Vercel deployment

This repository already includes `vercel.json` with explicit `tanstack-start` framework detection.

### Deploy

1. Push the branch to GitHub.
2. Import the repository in Vercel.
3. Keep the detected TanStack Start build settings.
4. Deploy.

Vercel will build the app with Nitro and deploy the Start server/runtime without changing the application model.

## Replacing localStorage with a hosted database

To move from local-only persistence to a hosted database later:

1. Keep the shared schemas in `schema.ts` as the request/response contract.
2. Replace the TanStack DB localStorage collection adapter in `collection.ts` and/or provide a new `TodoRepository` implementation in `repository.ts`.
3. Update `server-functions.ts` so reads/mutations persist server-side instead of returning normalized payloads for local commits.
4. Keep the route/component layer unchanged because it already depends on typed client wrappers rather than persistence internals.

## Scripts

- `npm run dev` — start the TanStack Start dev server
- `npm run generate-routes` — regenerate the file-based route tree
- `npm run test` — run Vitest once
- `npm run test:watch` — run Vitest in watch mode
- `npm run typecheck` — run TypeScript type checking
- `npm run lint` — run ESLint
- `npm run build` — create the production build
