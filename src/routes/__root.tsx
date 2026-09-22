import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRoute,
} from '@tanstack/react-router'

import appCss from '../styles.css?url'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'TanStack Start Todos',
      },
      {
        name: 'description',
        content:
          'A local-first TanStack Start todo application with typed server functions and TanStack DB persistence.',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),
  shellComponent: RootDocument,
  component: RootLayout,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  )
}

function RootLayout() {
  return (
    <div className="app-shell">
      <header className="hero">
        <p className="eyebrow">TanStack Start + TanStack DB</p>
        <h1>Todo management</h1>
        <p className="hero-copy">
          Create, search, filter, edit, and delete todos
        </p>
      </header>

      <main className="page-shell">
        <Outlet />
      </main>
    </div>
  )
}
