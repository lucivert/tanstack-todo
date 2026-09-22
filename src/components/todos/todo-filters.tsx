import { useEffect, useState } from 'react'

import type { TodoStatusFilter } from '../../lib/todos/schema'

const SEARCH_DEBOUNCE_MS = 300

type TodoFiltersProps = {
  search: string
  status: TodoStatusFilter
  onSearchChange: (value: string) => void
  onStatusChange: (value: TodoStatusFilter) => void
}

export function TodoFilters({
  search,
  status,
  onSearchChange,
  onStatusChange,
}: TodoFiltersProps) {
  const [searchDraft, setSearchDraft] = useState(search)

  useEffect(() => {
    setSearchDraft(search)
  }, [search])

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      if (searchDraft !== search) {
        onSearchChange(searchDraft)
      }
    }, SEARCH_DEBOUNCE_MS)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [onSearchChange, search, searchDraft])

  return (
    <section aria-label="Todo filters" className="panel controls-grid">
      <label className="field">
        <span>Search todos</span>
        <input
          aria-label="Search todos"
          className="input"
          name="search"
          placeholder="Search descriptions"
          type="search"
          value={searchDraft}
          onChange={(event) => {
            setSearchDraft(event.target.value)
          }}
        />
      </label>

      <label className="field">
        <span>Status</span>
        <select
          aria-label="Filter by status"
          className="input"
          name="status"
          value={status}
          onChange={(event) => {
            onStatusChange(event.target.value as TodoStatusFilter)
          }}
        >
          <option value="all">All statuses</option>
          <option value="to-do">To-do</option>
          <option value="in-progress">In progress</option>
          <option value="done">Done</option>
        </select>
      </label>
    </section>
  )
}

export { SEARCH_DEBOUNCE_MS }
