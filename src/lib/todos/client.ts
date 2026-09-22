import { useEffect, useMemo, useState } from 'react'
import { useLiveQuery } from '@tanstack/react-db'

import {
  TodoNotFoundError,
  applyTodoFilters,
  buildDeleteTodo,
  getTodoNotFoundMessage,
  parseTodoSearch,
} from './contracts'
import { todoCollection } from './collection'
import { toPlainTodo, todoRepository, type TodoRepository } from './repository'
import {
  createTodoServerFn,
  deleteTodoServerFn,
  listTodosServerFn,
  updateTodoServerFn,
} from './server-functions'
import {
  type CreateTodoInput,
  type TodoSearch,
  type UpdateTodoInput,
} from './schema'

export async function listTodos(
  input: TodoSearch,
  repository: TodoRepository = todoRepository,
) {
  const normalizedSearch = await listTodosServerFn({ data: input })
  return repository.list(normalizedSearch)
}

export async function createTodo(
  input: CreateTodoInput,
  repository: TodoRepository = todoRepository,
) {
  const nextTodo = await createTodoServerFn({ data: input })
  return repository.save(nextTodo)
}

export async function updateTodo(
  input: Omit<UpdateTodoInput, 'existingTodo'>,
  repository: TodoRepository = todoRepository,
) {
  const existingTodo = await repository.getById(input.id)

  if (!existingTodo) {
    throw new TodoNotFoundError(input.id)
  }

  const nextTodo = await updateTodoServerFn({
    data: { ...input, existingTodo },
  })

  return repository.save(nextTodo)
}

export async function deleteTodo(
  id: string,
  repository: TodoRepository = todoRepository,
) {
  const normalizedInput = buildDeleteTodo({ id })
  const existingTodo = await repository.getById(normalizedInput.id)

  if (!existingTodo) {
    throw new TodoNotFoundError(normalizedInput.id)
  }

  const result = await deleteTodoServerFn({ data: normalizedInput })
  await repository.remove(result.id)

  return result
}

export function useTodoHydration() {
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    let isActive = true

    void todoCollection.preload().finally(() => {
      if (isActive) {
        setIsHydrated(true)
      }
    })

    return () => {
      isActive = false
    }
  }, [])

  return isHydrated
}

export function useTodos(filters: TodoSearch) {
  const normalizedSearch = useMemo(() => parseTodoSearch(filters), [filters])
  const query = useLiveQuery({
    query: (q) => q.from({ todo: todoCollection }),
  })

  return useMemo(
    () => ({
      ...query,
      data: query.data
        ? applyTodoFilters(
            query.data.map((todo) => toPlainTodo(todo as Parameters<typeof toPlainTodo>[0])),
            normalizedSearch,
          )
        : [],
    }),
    [normalizedSearch, query],
  )
}

export function getMissingTodoMessage(id: string) {
  return getTodoNotFoundMessage(id)
}
