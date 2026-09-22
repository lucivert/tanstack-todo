import { createCollection, localStorageCollectionOptions } from '@tanstack/react-db'
import type { StorageApi, StorageEventApi } from '@tanstack/react-db'

import { todoSchema } from './schema'

export const TODO_STORAGE_KEY = 'tanstack-start-todos'

export function createTodoCollection(options: {
  storage?: StorageApi
  storageEventApi?: StorageEventApi
  storageKey?: string
} = {}) {
  return createCollection(
    localStorageCollectionOptions({
      id: 'todos',
      storageKey: options.storageKey ?? TODO_STORAGE_KEY,
      storage: options.storage,
      storageEventApi: options.storageEventApi,
      getKey: (todo) => todo.id,
      schema: todoSchema,
    }),
  )
}

export const todoCollection = createTodoCollection()
