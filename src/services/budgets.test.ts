import { afterEach, describe, expect, it, vi } from 'vitest'
import { makeBudget, makeBudgetSummary } from '../test/budgets'
import { makePaginationMeta } from '../test/reviews'

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  })
}

const page = (data: unknown[], hasNext = false) =>
  jsonResponse({ data, meta: makePaginationMeta({ hasNext }) })

async function load(fetchMock: ReturnType<typeof vi.fn>) {
  vi.stubEnv('VITE_API_URL', 'http://api.test')
  vi.stubGlobal('fetch', fetchMock)
  return import('./budgets')
}

const request = (fetchMock: ReturnType<typeof vi.fn>, call = 0) =>
  fetchMock.mock.calls[call][0] as Request

describe('budget services', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
    vi.resetModules()
  })

  it('gets the summary of a trip', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(makeBudgetSummary()))
    const { getBudgetSummary } = await load(fetchMock)

    await expect(getBudgetSummary('t1')).resolves.toMatchObject({ planned: 10531 })
    expect(request(fetchMock).url).toBe('http://api.test/api/trips/t1/budget/summary')
  })

  it('looks for the trip budget page by page', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(page([makeBudget({ id: 'other', tripId: 't9' })], true))
      .mockResolvedValueOnce(page([makeBudget()]))
    const { findBudget } = await load(fetchMock)

    await expect(findBudget('t1')).resolves.toMatchObject({ id: 'b1' })
    expect(request(fetchMock, 1).url).toContain('page=2&limit=100')
  })

  it('stops at the first page that has it, and returns null when none does', async () => {
    const first = vi.fn().mockResolvedValue(page([makeBudget()], true))
    await (await load(first)).findBudget('t1')
    expect(first).toHaveBeenCalledTimes(1)

    vi.resetModules()
    const none = vi.fn().mockResolvedValue(page([]))
    await expect((await load(none)).findBudget('t1')).resolves.toBeNull()
  })

  it('creates, updates and deletes the budget', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse(makeBudget(), 201))
      .mockResolvedValueOnce(jsonResponse(makeBudget({ totalValue: 20 })))
      .mockResolvedValueOnce(new Response(null, { status: 204 }))
    const { createBudget, updateBudget, deleteBudget } = await load(fetchMock)

    await createBudget('t1', 17000)
    await updateBudget('b1', 20)
    await deleteBudget('b1')

    const sent = [0, 1, 2].map((call) => {
      const { method, url } = request(fetchMock, call)
      return `${method} ${url.replace('http://api.test', '')}`
    })
    expect(sent).toEqual(['POST /api/budgets', 'PATCH /api/budgets/b1', 'DELETE /api/budgets/b1'])
    await expect(request(fetchMock, 0).json()).resolves.toEqual({ tripId: 't1', totalValue: 17000 })
    await expect(request(fetchMock, 1).json()).resolves.toEqual({ totalValue: 20 })
  })

  it.each([403, 409])('throws an ApiError on a %i', async (status) => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ message: 'x' }, status))
    const { createBudget } = await load(fetchMock)

    await expect(createBudget('t1', 1)).rejects.toMatchObject({ status })
  })
})
