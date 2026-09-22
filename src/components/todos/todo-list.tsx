import { useState } from 'react'

import type { Todo, TodoStatus } from '../../lib/todos/schema'

function formatTimestamp(value: string) {
  return new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

type TodoListProps = {
  todos: Todo[]
  emptyMessage: string
  onDelete: (id: string) => Promise<void>
  onUpdate: (input: {
    id: string
    description: string
    status: TodoStatus
  }) => Promise<void>
}

export function TodoList({
  todos,
  emptyMessage,
  onDelete,
  onUpdate,
}: TodoListProps) {
  if (!todos.length) {
    return (
      <section className="panel empty-state" aria-live="polite">
        <h2>No matching todos</h2>
        <p>{emptyMessage}</p>
      </section>
    )
  }

  return (
    <section aria-live="polite" className="todo-list">
      {todos.map((todo) => (
        <TodoListItem
          key={todo.id}
          todo={todo}
          onDelete={onDelete}
          onUpdate={onUpdate}
        />
      ))}
    </section>
  )
}

type TodoListItemProps = {
  todo: Todo
  onDelete: (id: string) => Promise<void>
  onUpdate: (input: {
    id: string
    description: string
    status: TodoStatus
  }) => Promise<void>
}

function TodoListItem({ todo, onDelete, onUpdate }: TodoListItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [description, setDescription] = useState(todo.description)
  const [status, setStatus] = useState<TodoStatus>(todo.status)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  return (
    <article className="panel todo-card">
      <div className="todo-card-header">
        <div>
          <p className={`status-pill status-${todo.status}`}>{todo.status}</p>
          <h2>{todo.description}</h2>
        </div>

        <div className="button-row">
          <button
            className="button"
            type="button"
            onClick={() => {
              setDescription(todo.description)
              setStatus(todo.status)
              setErrorMessage(null)
              setIsEditing((currentValue) => !currentValue)
            }}
          >
            {isEditing ? 'Cancel' : 'Edit'}
          </button>
          <button
            className="button button-danger"
            disabled={isDeleting}
            type="button"
            onClick={async () => {
              setIsDeleting(true)
              setErrorMessage(null)

              try {
                await onDelete(todo.id)
              } catch (error) {
                setErrorMessage(
                  error instanceof Error ? error.message : 'Failed to delete todo.',
                )
              } finally {
                setIsDeleting(false)
              }
            }}
          >
            {isDeleting ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>

      {isEditing ? (
        <form
          className="edit-grid"
          onSubmit={async (event) => {
            event.preventDefault()
            setIsSaving(true)
            setErrorMessage(null)

            try {
              await onUpdate({ id: todo.id, description, status })
              setIsEditing(false)
            } catch (error) {
              setErrorMessage(
                error instanceof Error ? error.message : 'Failed to update todo.',
              )
            } finally {
              setIsSaving(false)
            }
          }}
        >
          <label className="field field-grow">
            <span>Description</span>
            <input
              aria-label={`Edit description for ${todo.description}`}
              className="input"
              type="text"
              value={description}
              onChange={(event) => {
                setDescription(event.target.value)
              }}
            />
          </label>

          <label className="field">
            <span>Status</span>
            <select
              aria-label={`Edit status for ${todo.description}`}
              className="input"
              value={status}
              onChange={(event) => {
                setStatus(event.target.value as TodoStatus)
              }}
            >
              <option value="to-do">To-do</option>
              <option value="in-progress">In progress</option>
              <option value="done">Done</option>
            </select>
          </label>

          <button className="button button-primary" disabled={isSaving} type="submit">
            {isSaving ? 'Saving…' : 'Save changes'}
          </button>
        </form>
      ) : null}

      <dl className="todo-meta">
        <div>
          <dt>Created</dt>
          <dd>{formatTimestamp(todo.createdAt)}</dd>
        </div>
        <div>
          <dt>Updated</dt>
          <dd>{formatTimestamp(todo.updatedAt)}</dd>
        </div>
      </dl>

      {errorMessage ? (
        <p className="error-message" role="alert">
          {errorMessage}
        </p>
      ) : null}
    </article>
  )
}

export function TodoListSkeleton() {
  return (
    <section aria-label="Loading todos" className="todo-list">
      {Array.from({ length: 3 }, (_, index) => (
        <article key={index} className="panel todo-card skeleton-card" />
      ))}
    </section>
  )
}
