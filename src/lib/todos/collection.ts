import { createCollection, localStorageCollectionOptions } from '@tanstack/react-db'
import type { StorageApi, StorageEventApi } from '@tanstack/react-db'

import { todoSchema } from './schema'

export const TODO_STORAGE_KEY = 'tanstack-start-todos'

function createInMemoryStorage(): StorageApi {
  const storage = new Map<string, string>()

  return {
    getItem(key) {
      return storage.get(key) ?? null
    },
    setItem(key, value) {
      storage.set(key, value)
    },
    removeItem(key) {
      storage.delete(key)
    },
  }
}

function createNoopStorageEvents(): StorageEventApi {
  return {
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
  }
}

function getDefaultStorage() {
  return typeof window === 'undefined' ? createInMemoryStorage() : window.localStorage
}

function getDefaultStorageEvents() {
  return typeof window === 'undefined' ? createNoopStorageEvents() : window
}

export function createTodoCollection(options: {
  storage?: StorageApi
  storageEventApi?: StorageEventApi
  storageKey?: string
} = {}) {
  return createCollection(
    localStorageCollectionOptions({
      id: 'todos',
      storageKey: options.storageKey ?? TODO_STORAGE_KEY,
      storage: options.storage ?? getDefaultStorage(),
      storageEventApi: options.storageEventApi ?? getDefaultStorageEvents(),
      getKey: (todo) => todo.id,
      schema: todoSchema,
    }),
  )
}

export const todoCollection = createTodoCollection()

export type TodoCollection = ReturnType<typeof createTodoCollection>
