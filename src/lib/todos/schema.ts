import { z } from 'zod'

export const TODO_STATUSES = ['to-do', 'in-progress', 'done'] as const
export const TODO_STATUS_FILTERS = ['all', ...TODO_STATUSES] as const

export const TODO_ID_REQUIRED_MESSAGE = 'Todo id is required.'
export const TODO_DESCRIPTION_REQUIRED_MESSAGE =
  'Description must not be empty after trimming.'

export const todoStatusSchema = z.enum(TODO_STATUSES)
export const todoStatusFilterSchema = z.enum(TODO_STATUS_FILTERS)
export const isoDateStringSchema = z.string().datetime()

export const todoSchema = z.object({
  id: z.string().trim().min(1, TODO_ID_REQUIRED_MESSAGE),
  description: z.string().min(1, TODO_DESCRIPTION_REQUIRED_MESSAGE),
  status: todoStatusSchema,
  createdAt: isoDateStringSchema,
  updatedAt: isoDateStringSchema,
})

export const todoSearchSchema = z.object({
  q: z.string().optional().default(''),
  status: todoStatusFilterSchema.optional().default('all'),
})

export const createTodoInputSchema = z.object({
  description: z.string(),
  status: todoStatusSchema.optional().default('to-do'),
})

export const updateTodoInputSchema = z.object({
  id: z.string().trim().min(1, TODO_ID_REQUIRED_MESSAGE),
  description: z.string(),
  status: todoStatusSchema,
  existingTodo: todoSchema,
})

export const deleteTodoInputSchema = z.object({
  id: z.string().trim().min(1, TODO_ID_REQUIRED_MESSAGE),
})

export type TodoStatus = z.infer<typeof todoStatusSchema>
export type TodoStatusFilter = z.infer<typeof todoStatusFilterSchema>
export type Todo = z.infer<typeof todoSchema>
export type TodoSearch = z.infer<typeof todoSearchSchema>
export type CreateTodoInput = z.input<typeof createTodoInputSchema>
export type UpdateTodoInput = z.input<typeof updateTodoInputSchema>
export type DeleteTodoInput = z.input<typeof deleteTodoInputSchema>
