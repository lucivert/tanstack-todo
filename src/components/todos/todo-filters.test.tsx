import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { SEARCH_DEBOUNCE_MS, TodoFilters } from './todo-filters'

describe('TodoFilters', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('debounces free-text search updates and applies status changes immediately', () => {
    const onSearchChange = vi.fn()
    const onStatusChange = vi.fn()

    render(
      <TodoFilters
        search=""
        status="all"
        onSearchChange={onSearchChange}
        onStatusChange={onStatusChange}
      />,
    )

    fireEvent.change(screen.getByLabelText(/search todos/i), {
      target: { value: 'release' },
    })

    expect(onSearchChange).not.toHaveBeenCalled()

    vi.advanceTimersByTime(SEARCH_DEBOUNCE_MS)

    expect(onSearchChange).toHaveBeenCalledTimes(1)
    expect(onSearchChange).toHaveBeenCalledWith('release')

    fireEvent.change(screen.getByLabelText(/filter by status/i), {
      target: { value: 'done' },
    })

    expect(onStatusChange).toHaveBeenCalledTimes(1)
    expect(onStatusChange).toHaveBeenCalledWith('done')
  })
})
