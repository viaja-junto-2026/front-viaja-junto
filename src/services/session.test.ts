import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  clearToken,
  consumeRedirectTarget,
  getToken,
  notifyUnauthorized,
  saveRedirectTarget,
  saveToken,
  setUnauthorizedHandler,
} from './session'

describe('session token', () => {
  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('stores and reads the token', () => {
    saveToken('abc', 3600)

    expect(getToken()).toBe('abc')
  })

  it('keeps a token that has no expiration', () => {
    saveToken('abc')

    expect(getToken()).toBe('abc')
  })

  it('discards the token after it expires', () => {
    vi.useFakeTimers()
    saveToken('abc', 60)

    vi.advanceTimersByTime(61_000)

    expect(getToken()).toBeNull()
    expect(window.localStorage.length).toBe(0)
  })

  it('clears the token', () => {
    saveToken('abc', 3600)

    clearToken()

    expect(getToken()).toBeNull()
  })

  it('returns null when nothing is stored or the stored value is corrupted', () => {
    expect(getToken()).toBeNull()

    window.localStorage.setItem('viajajunto.session', 'not json')

    expect(getToken()).toBeNull()
  })

  it('does not break when the browser storage is unavailable', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
      throw new Error('blocked')
    })

    expect(() => saveToken('abc')).not.toThrow()
    expect(() => clearToken()).not.toThrow()
    expect(() => saveRedirectTarget('/trips')).not.toThrow()
  })
})

describe('unauthorized handler', () => {
  it('clears the token and calls the registered handler', () => {
    const handler = vi.fn()
    setUnauthorizedHandler(handler)
    saveToken('abc', 3600)

    notifyUnauthorized()

    expect(handler).toHaveBeenCalledOnce()
    expect(getToken()).toBeNull()
  })

  it('stops calling the handler after it is removed', () => {
    const handler = vi.fn()
    const remove = setUnauthorizedHandler(handler)

    remove()
    notifyUnauthorized()

    expect(handler).not.toHaveBeenCalled()
  })

  it('does not remove a newer handler when an old one is removed', () => {
    const oldHandler = vi.fn()
    const newHandler = vi.fn()
    const removeOld = setUnauthorizedHandler(oldHandler)
    const removeNew = setUnauthorizedHandler(newHandler)

    removeOld()
    notifyUnauthorized()

    expect(newHandler).toHaveBeenCalledOnce()
    removeNew()
  })
})

describe('redirect target', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('stores the target once and reads it only one time', () => {
    saveRedirectTarget('/trips/42?tab=budget')

    expect(consumeRedirectTarget()).toBe('/trips/42?tab=budget')
    expect(consumeRedirectTarget()).toBeNull()
  })

  it('ignores addresses that point outside the app', () => {
    saveRedirectTarget('https://evil.example')
    saveRedirectTarget('//evil.example')

    expect(consumeRedirectTarget()).toBeNull()
  })

  it('refuses an external address that was written in the storage by someone else', () => {
    window.sessionStorage.setItem('viajajunto.redirect', 'https://evil.example')

    expect(consumeRedirectTarget()).toBeNull()
  })

  it('returns null when the browser storage is unavailable', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked')
    })

    expect(consumeRedirectTarget()).toBeNull()
  })
})
