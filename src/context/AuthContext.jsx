import { createContext, useContext, useState, useEffect, useCallback } from "react"

const AuthContext = createContext(null)

const API       = "https://linariaskc.com"
const TOKEN_KEY = "auth_token"

export function AuthProvider({ children }) {
  const [user,  setUser]  = useState(undefined) // undefined = loading, null = logged out
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY))

  // On mount: extract token from URL if coming from OAuth redirect
  useEffect(() => {
    const params   = new URLSearchParams(window.location.search)
    const urlToken = params.get("token")
    const authErr  = params.get("auth_error")

    if (urlToken) {
      localStorage.setItem(TOKEN_KEY, urlToken)
      setToken(urlToken)
      window.history.replaceState({}, "", "/")
    } else if (authErr) {
      window.history.replaceState({}, "", "/")
      setUser(null)
    }
  }, [])

  // Fetch user profile whenever token changes
  useEffect(() => {
    if (!token) { setUser(null); return }
    fetch(`${API}/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => {
        if (!r.ok) throw new Error("Unauthorized")
        return r.json()
      })
      .then(setUser)
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY)
        setToken(null)
        setUser(null)
      })
  }, [token])

  const login = useCallback((newToken) => {
    localStorage.setItem(TOKEN_KEY, newToken)
    setToken(newToken)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem("flight-deals-cache")
    setToken(null)
    setUser(null)
  }, [])

  // Refresh the user object from the server (call after settings changes)
  const refreshUser = useCallback(() => {
    const t = localStorage.getItem(TOKEN_KEY)
    if (!t) return
    fetch(`${API}/auth/me`, { headers: { Authorization: `Bearer ${t}` } })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(setUser)
      .catch(() => {})
  }, [])

  const authFetch = useCallback((url, options = {}) => {
    const t = localStorage.getItem(TOKEN_KEY)
    return fetch(url, {
      ...options,
      headers: {
        ...(options.headers || {}),
        ...(t ? { Authorization: `Bearer ${t}` } : {}),
      },
    })
  }, [])

  return (
    <AuthContext.Provider value={{ user, token, login, logout, refreshUser, authFetch }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
