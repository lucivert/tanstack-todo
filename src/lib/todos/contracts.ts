import {
  TODO_DESCRIPTION_REQUIRED_MESSAGE,
  TODO_ID_REQUIRED_MESSAGE,
  createTodoInputSchema,
  deleteTodoInputSchema,
  todoSchema,
  todoSearchSchema,
  updateTodoInputSchema,
  type CreateTodoInput,
  type DeleteTodoInput,
  type Todo,
  type TodoSearch,
  type TodoStatus,
  type UpdateTodoInput,
} from './schema'

export class TodoNotFoundError extends Error {
  constructor(id: string) {
    super(getTodoNotFoundMessage(id))
    this.name = 'TodoNotFoundError'
  }
}

export function getTodoNotFoundMessage(id: string) {
  return `Todo \"${id}\" was not found.`
}

export function normalizeTodoDescription(description: string) {
  const normalized = description.trim()

  if (!normalized) {
    throw new Error(TODO_DESCRIPTION_REQUIRED_MESSAGE)
  }

  return normalized
}

export function nextUpdatedAt(previousUpdatedAt: string, now = new Date()) {
  const nextValue = now.toISOString()

  if (nextValue !== previousUpdatedAt) {
    return nextValue
  }

  return new Date(now.getTime() + 1).toISOString()
}

export function parseTodoSearch(input: unknown): TodoSearch {
  const parsed = todoSearchSchema.parse(input)

  return {
    q: parsed.q.trim(),
    status: parsed.status,
  }
}

export function buildCreateTodo(
  input: CreateTodoInput,
  options: { id?: string; now?: Date } = {},
): Todo {
  const parsed = createTodoInputSchema.parse(input)
  const now = options.now ?? new Date()
  const timestamp = now.toISOString()

  return todoSchema.parse({
    id: options.id ?? crypto.randomUUID(),
    description: normalizeTodoDescription(parsed.description),
    status: parsed.status,
    createdAt: timestamp,
    updatedAt: timestamp,
  })
}

export function buildUpdatedTodo(
  input: UpdateTodoInput,
  options: { now?: Date } = {},
): Todo {
  const parsed = updateTodoInputSchema.parse(input)

  if (parsed.id !== parsed.existingTodo.id) {
    throw new Error(TODO_ID_REQUIRED_MESSAGE)
  }

  return todoSchema.parse({
    ...parsed.existingTodo,
    description: normalizeTodoDescription(parsed.description),
    status: parsed.status as TodoStatus,
    updatedAt: nextUpdatedAt(
      parsed.existingTodo.updatedAt,
      options.now ?? new Date(),
    ),
  })
}

export function buildDeleteTodo(input: DeleteTodoInput) {
  return deleteTodoInputSchema.parse(input)
}

export function matchesTodoSearch(todo: Todo, filters: TodoSearch) {
  const normalizedSearch = filters.q.toLocaleLowerCase()
  const matchesText = normalizedSearch
    ? todo.description.toLocaleLowerCase().includes(normalizedSearch)
    : true
  const matchesStatus =
    filters.status === 'all' ? true : todo.status === filters.status

  return matchesText && matchesStatus
}

export function sortTodos(todos: readonly Todo[]) {
  return [...todos].sort((left, right) => {
    const updatedComparison =
      Date.parse(right.updatedAt) - Date.parse(left.updatedAt)

    if (updatedComparison !== 0) {
      return updatedComparison
    }

    return Date.parse(right.createdAt) - Date.parse(left.createdAt)
  })
}

export function applyTodoFilters(todos: readonly Todo[], filters: TodoSearch) {
  return sortTodos(todos.filter((todo) => matchesTodoSearch(todo, filters)))
}
