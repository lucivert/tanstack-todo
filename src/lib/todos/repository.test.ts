import { describe, expect, it } from 'vitest'

import {
  buildCreateTodo,
  buildUpdatedTodo,
  parseTodoSearch,
} from './contracts'
import {
  createCollectionTodoRepository,
  createTodoCollection,
} from './repository'

function createMemoryStorage() {
  const storage = new Map<string, string>()

  return {
    getItem(key: string) {
      return storage.get(key) ?? null
    },
    removeItem(key: string) {
      storage.delete(key)
    },
    setItem(key: string, value: string) {
      storage.set(key, value)
    },
  }
}

const noopStorageEvents = {
  addEventListener: () => undefined,
  removeEventListener: () => undefined,
}

function createRepositoryHarness(storageKey: string = crypto.randomUUID()) {
  const storage = createMemoryStorage()
  const collection = createTodoCollection({
    storage,
    storageEventApi: noopStorageEvents,
    storageKey,
  })

  return {
    storage,
    collection,
    repository: createCollectionTodoRepository(collection),
  }
}

describe('todo repository', () => {
  it('supports create, list, update, and delete workflows', async () => {
    const { repository, storage } = createRepositoryHarness('workflow')

    const planningTodo = buildCreateTodo(
      { description: 'Plan roadmap' },
      {
        id: 'todo-a',
        now: new Date('2026-09-22T18:40:00.000Z'),
      },
    )
    const shippedTodo = buildCreateTodo(
      { description: 'Ship roadmap', status: 'done' },
      {
        id: 'todo-b',
        now: new Date('2026-09-22T18:41:00.000Z'),
      },
    )

    await repository.save(planningTodo)
    await repository.save(shippedTodo)

    expect(storage.getItem('workflow')).toContain('todo-a')
    expect(await repository.list(parseTodoSearch({}))).toEqual([
      shippedTodo,
      planningTodo,
    ])

    const updatedPlanningTodo = buildUpdatedTodo(
      {
        id: planningTodo.id,
        description: 'Plan public roadmap',
        status: 'in-progress',
        existingTodo: planningTodo,
      },
      {
        now: new Date('2026-09-22T18:45:00.000Z'),
      },
    )

    await repository.save(updatedPlanningTodo)

    expect(await repository.getById(planningTodo.id)).toEqual(updatedPlanningTodo)
    expect(updatedPlanningTodo.createdAt).toBe(planningTodo.createdAt)
    expect(updatedPlanningTodo.updatedAt).not.toBe(planningTodo.updatedAt)

    await repository.remove(shippedTodo.id)

    expect(await repository.getById(shippedTodo.id)).toBeUndefined()
    expect(await repository.list(parseTodoSearch({}))).toEqual([
      updatedPlanningTodo,
    ])
  })

  it('filters todos by search text and status', async () => {
    const { repository } = createRepositoryHarness('filtering')

    const docsTodo = buildCreateTodo(
      { description: 'Write documentation', status: 'done' },
      { id: 'todo-docs', now: new Date('2026-09-22T18:50:00.000Z') },
    )
    const codeTodo = buildCreateTodo(
      { description: 'Refactor todo repository', status: 'in-progress' },
      { id: 'todo-code', now: new Date('2026-09-22T18:51:00.000Z') },
    )

    await repository.save(docsTodo)
    await repository.save(codeTodo)

    expect(
      await repository.list(parseTodoSearch({ q: 'repo', status: 'all' })),
    ).toEqual([codeTodo])
    expect(
      await repository.list(parseTodoSearch({ q: 'write', status: 'done' })),
    ).toEqual([docsTodo])
    expect(
      await repository.list(
        parseTodoSearch({ q: 'missing', status: 'in-progress' }),
      ),
    ).toEqual([])
  })
})
