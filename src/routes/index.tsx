import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'

import { TodoCreateForm } from '../components/todos/todo-create-form'
import { TodoFilters } from '../components/todos/todo-filters'
import { TodoList, TodoListSkeleton } from '../components/todos/todo-list'
import {
  createTodo,
  deleteTodo,
  updateTodo,
  useTodoHydration,
  useTodos,
} from '../lib/todos/client'
import { listTodosServerFn } from '../lib/todos/server-functions'
import { parseTodoSearch } from '../lib/todos/contracts'

export const Route = createFileRoute('/')({
  head: () => ({
    meta: [
      {
        title: 'Todos | TanStack Start',
      },
    ],
  }),
  validateSearch: (search) => parseTodoSearch(search),
  loaderDeps: ({ search }) => search,
  loader: async ({ deps }) => {
    const filters = await listTodosServerFn({ data: deps })
    return { filters }
  },
  component: Home,
})

function Home() {
  const navigate = Route.useNavigate()
  const { filters } = Route.useLoaderData()
  const isHydrated = useTodoHydration()
  const todosQuery = useTodos(filters)
  const [pageError, setPageError] = useState<string | null>(null)

  return (
    <div className="stack-lg">
      <TodoCreateForm
        onCreate={async (description) => {
          setPageError(null)
          await createTodo({ description })
        }}
      />

      <TodoFilters
        search={filters.q}
        status={filters.status}
        onSearchChange={(value) => {
          void navigate({
            search: (previous) => ({
              ...previous,
              q: value,
            }),
            replace: true,
          })
        }}
        onStatusChange={(value) => {
          void navigate({
            search: (previous) => ({
              ...previous,
              status: value,
            }),
            replace: true,
          })
        }}
      />

      {pageError ? (
        <p className="error-message" role="alert">
          {pageError}
        </p>
      ) : null}

      {!isHydrated || todosQuery.isLoading ? (
        <TodoListSkeleton />
      ) : (
        <TodoList
          emptyMessage={
            filters.q || filters.status !== 'all'
              ? 'Try a different search term or reset the status filter.'
              : 'Add your first todo to start tracking work locally.'
          }
          todos={todosQuery.data}
          onDelete={async (id) => {
            setPageError(null)
            try {
              await deleteTodo(id)
            } catch (error) {
              setPageError(
                error instanceof Error ? error.message : 'Failed to delete todo.',
              )
              throw error
            }
          }}
          onUpdate={async (input) => {
            setPageError(null)
            try {
              await updateTodo(input)
            } catch (error) {
              setPageError(
                error instanceof Error ? error.message : 'Failed to update todo.',
              )
              throw error
            }
          }}
        />
      )}
    </div>
  )
}
