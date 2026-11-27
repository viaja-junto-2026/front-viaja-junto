import { act, renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AuthContext } from '../auth/authContext'
import {
  createBudget,
  deleteBudget,
  findBudget,
  getBudgetSummary,
  updateBudget,
} from '../services/budgets'
import { makeAuthValue } from '../test/auth'
import { makeBudget, makeBudgetSummary } from '../test/budgets'
import { createQueryWrapper } from '../test/query'
import { useBudget } from './useBudget'

vi.mock('../services/budgets', () => ({
  getBudgetSummary: vi.fn(),
  findBudget: vi.fn(),
  createBudget: vi.fn(),
  updateBudget: vi.fn(),
  deleteBudget: vi.fn(),
}))

function renderBudget() {
  const QueryWrapper = createQueryWrapper()
  return renderHook(() => useBudget('t1'), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <QueryWrapper>
        <AuthContext.Provider value={makeAuthValue()}>{children}</AuthContext.Provider>
      </QueryWrapper>
    ),
  })
}

describe('useBudget', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    vi.mocked(getBudgetSummary).mockResolvedValue(makeBudgetSummary())
  })

  it('loads the summary of the trip', async () => {
    const { result } = renderBudget()

    await waitFor(() => expect(result.current.summary.data?.planned).toBe(10531))
    expect(getBudgetSummary).toHaveBeenCalledWith('t1')
    expect(findBudget).not.toHaveBeenCalled()
  })

  it.each([
    ['creates the first budget', null, 'create'],
    ['updates the existing one', makeBudget(), 'update'],
  ])('%s and loads the summary again', async (_, current, expected) => {
    vi.mocked(findBudget).mockResolvedValue(current)
    const { result } = renderBudget()
    await waitFor(() => expect(result.current.summary.isSuccess).toBe(true))

    await act(() => result.current.save.mutateAsync(900))

    if (expected === 'create') expect(createBudget).toHaveBeenCalledWith('t1', 900)
    else expect(updateBudget).toHaveBeenCalledWith('b1', 900)
    expect(getBudgetSummary).toHaveBeenCalledTimes(2)
  })

  it('removes the budget and loads the summary again', async () => {
    vi.mocked(findBudget).mockResolvedValue(makeBudget())
    const { result } = renderBudget()
    await waitFor(() => expect(result.current.summary.isSuccess).toBe(true))

    await act(() => result.current.remove.mutateAsync())

    expect(deleteBudget).toHaveBeenCalledWith('b1')
    expect(getBudgetSummary).toHaveBeenCalledTimes(2)
  })
})
