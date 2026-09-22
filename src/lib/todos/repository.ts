import { applyTodoFilters } from './contracts'
import { createTodoCollection, todoCollection } from './collection'
import { todoSchema } from './schema'
import type { Todo, TodoSearch } from './schema'

export interface TodoRepository {
  list: (filters: TodoSearch) => Promise<Todo[]>
  getById: (id: string) => Promise<Todo | undefined>
  save: (todo: Todo) => Promise<Todo>
  remove: (id: string) => Promise<void>
}

type TodoCollection = ReturnType<typeof createTodoCollection>

export function toPlainTodo(value: {
  id: string
  description: string
  status: Todo['status']
  createdAt: string
  updatedAt: string
}) {
  return todoSchema.parse(value)
}

export function createCollectionTodoRepository(
  collection: TodoCollection = todoCollection,
): TodoRepository {
  return {
    list: async (filters) =>
      applyTodoFilters(collection.toArray.map((todo) => toPlainTodo(todo)), filters),
    getById: async (id) => {
      const existingTodo = collection.state.get(id)

      return existingTodo ? toPlainTodo(existingTodo) : undefined
    },
    save: async (todo) => {
      const existingTodo = collection.state.get(todo.id)
      const transaction = existingTodo
        ? collection.update(todo.id, (draft) => {
            draft.description = todo.description
            draft.status = todo.status
            draft.createdAt = todo.createdAt
            draft.updatedAt = todo.updatedAt
          })
        : collection.insert(todo)

      await transaction.isPersisted.promise

      return todo
    },
    remove: async (id) => {
      const transaction = collection.delete(id)
      await transaction.isPersisted.promise
    },
  }
}

export const todoRepository = createCollectionTodoRepository(todoCollection)

export { createTodoCollection }
