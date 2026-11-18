/**
 * Sessão do usuário no navegador: guarda o token de acesso e avisa quando a API recusa o token (401).
 *
 * O token fica no localStorage junto com o horário de expiração (`expires_in` devolvido pela API).
 * Assim a sessão sobrevive a recarregar a página, mas nunca é usada depois de expirada.
 * O token nunca vai para logs nem para a URL.
 */
const SESSION_KEY = 'viajajunto.session'
const REDIRECT_KEY = 'viajajunto.redirect'

interface StoredSession {
  token: string
  expiresAt: number | null
}

export function saveToken(token: string, expiresInSeconds?: number): void {
  const session: StoredSession = {
    token,
    expiresAt: expiresInSeconds ? Date.now() + expiresInSeconds * 1000 : null,
  }
  try {
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  } catch {
    // Armazenamento indisponível (modo privado, por exemplo): a sessão vale só até recarregar.
  }
}

export function getToken(): string | null {
  try {
    const raw = window.localStorage.getItem(SESSION_KEY)
    if (!raw) return null
    const session = JSON.parse(raw) as StoredSession
    if (session.expiresAt !== null && Date.now() >= session.expiresAt) {
      clearToken()
      return null
    }
    return session.token
  } catch {
    return null
  }
}

export function clearToken(): void {
  try {
    window.localStorage.removeItem(SESSION_KEY)
  } catch {
    // Nada a fazer se o armazenamento estiver indisponível.
  }
}

let unauthorizedHandler: (() => void) | null = null

/** Registra quem deve ser avisado quando a API responde 401. Devolve a função que remove o registro. */
export function setUnauthorizedHandler(handler: () => void): () => void {
  unauthorizedHandler = handler
  return () => {
    if (unauthorizedHandler === handler) unauthorizedHandler = null
  }
}

/** Chamado quando a API recusa o token: descarta a sessão e avisa a interface. */
export function notifyUnauthorized(): void {
  clearToken()
  unauthorizedHandler?.()
}

/** Só aceita caminhos internos do app, para ninguém ser levado a outro site depois do login. */
function isInternalPath(path: string): boolean {
  return path.startsWith('/') && !path.startsWith('//')
}

/** Guarda a página que o usuário queria abrir, para voltar a ela depois do login com o Google. */
export function saveRedirectTarget(path: string): void {
  if (!isInternalPath(path)) return
  try {
    window.sessionStorage.setItem(REDIRECT_KEY, path)
  } catch {
    // Sem armazenamento, o usuário cai na página padrão depois do login.
  }
}

/** Lê e apaga a página guardada por `saveRedirectTarget`. */
export function consumeRedirectTarget(): string | null {
  try {
    const path = window.sessionStorage.getItem(REDIRECT_KEY)
    window.sessionStorage.removeItem(REDIRECT_KEY)
    return path && isInternalPath(path) ? path : null
  } catch {
    return null
  }
}
