import { createServerFn } from '@tanstack/react-start'

import {
  buildCreateTodo,
  buildDeleteTodo,
  buildUpdatedTodo,
  parseTodoSearch,
} from './contracts'
import {
  createTodoInputSchema,
  deleteTodoInputSchema,
  todoSearchSchema,
  updateTodoInputSchema,
} from './schema'

export const listTodosServerFn = createServerFn({ method: 'GET' })
  .validator(todoSearchSchema)
  .handler(async ({ data }) => parseTodoSearch(data))

export const createTodoServerFn = createServerFn({ method: 'POST' })
  .validator(createTodoInputSchema)
  .handler(async ({ data }) => buildCreateTodo(data))

export const updateTodoServerFn = createServerFn({ method: 'POST' })
  .validator(updateTodoInputSchema)
  .handler(async ({ data }) => buildUpdatedTodo(data))

export const deleteTodoServerFn = createServerFn({ method: 'POST' })
  .validator(deleteTodoInputSchema)
  .handler(async ({ data }) => buildDeleteTodo(data))
