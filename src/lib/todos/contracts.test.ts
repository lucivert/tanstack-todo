import { describe, expect, it } from 'vitest'

import {
  TODO_DESCRIPTION_REQUIRED_MESSAGE,
  createTodoInputSchema,
  todoSearchSchema,
} from './schema'
import {
  TodoNotFoundError,
  buildCreateTodo,
  buildDeleteTodo,
  buildUpdatedTodo,
  getTodoNotFoundMessage,
  parseTodoSearch,
} from './contracts'

describe('todo contracts', () => {
  it('normalizes validated search params', () => {
    expect(parseTodoSearch({ q: '  release  ', status: 'done' })).toEqual({
      q: 'release',
      status: 'done',
    })

    expect(parseTodoSearch({})).toEqual({
      q: '',
      status: 'all',
    })
  })

  it('creates a normalized todo with timestamps and default status', () => {
    const now = new Date('2026-09-22T18:30:00.000Z')
    const todo = buildCreateTodo(
      {
        description: '  Ship the release  ',
      },
      { id: 'todo-1', now },
    )

    expect(todo).toEqual({
      id: 'todo-1',
      description: 'Ship the release',
      status: 'to-do',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    })
  })

  it('preserves createdAt and forces updatedAt to change during updates', () => {
    const original = buildCreateTodo(
      {
        description: 'Review pull request',
        status: 'in-progress',
      },
      {
        id: 'todo-2',
        now: new Date('2026-09-22T18:31:00.000Z'),
      },
    )

    const updated = buildUpdatedTodo(
      {
        id: original.id,
        description: '  Review merged pull request  ',
        status: 'done',
        existingTodo: original,
      },
      {
        now: new Date(original.updatedAt),
      },
    )

    expect(updated.createdAt).toBe(original.createdAt)
    expect(updated.updatedAt).not.toBe(original.updatedAt)
    expect(updated.description).toBe('Review merged pull request')
    expect(updated.status).toBe('done')
  })

  it('rejects blank descriptions for create and update', () => {
    expect(() =>
      buildCreateTodo({ description: '   ' }, { id: 'blank-create' }),
    ).toThrow(TODO_DESCRIPTION_REQUIRED_MESSAGE)

    const existingTodo = buildCreateTodo(
      { description: 'Keep me' },
      { id: 'blank-update' },
    )

    expect(() =>
      buildUpdatedTodo({
        id: existingTodo.id,
        description: '   ',
        status: 'to-do',
        existingTodo,
      }),
    ).toThrow(TODO_DESCRIPTION_REQUIRED_MESSAGE)
  })

  it('handles invalid statuses and delete contracts clearly', () => {
    expect(() => createTodoInputSchema.parse({ description: 'Ship', status: 'bad' })).toThrow()
    expect(() => todoSearchSchema.parse({ status: 'maybe' })).toThrow()
    expect(buildDeleteTodo({ id: 'todo-3' })).toEqual({ id: 'todo-3' })
  })

  it('exposes a clear missing-todo message', () => {
    expect(getTodoNotFoundMessage('missing-id')).toBe(
      'Todo "missing-id" was not found.',
    )
    expect(new TodoNotFoundError('missing-id').message).toBe(
      'Todo "missing-id" was not found.',
    )
  })
})
