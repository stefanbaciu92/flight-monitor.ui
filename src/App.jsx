import { useState, useRef, useEffect } from "react"
import { AuthProvider, useAuth } from "./context/AuthContext"
import LandingPage from "./pages/LandingPage"
import CompleteProfilePage from "./pages/CompleteProfilePage"
import DealsPage from "./pages/DealsPage"
import DestinationsPage from "./pages/DestinationsPage"
import SettingsPage from "./pages/SettingsPage"
import PlanetLoader from "./components/PlanetLoader"
import "./App.css"

const S = {
  wrap: { position: "fixed", top: 20, right: 20, zIndex: 200 },
  btn: {
    display: "flex", flexDirection: "column", justifyContent: "center",
    alignItems: "center", gap: 5, width: 44, height: 44,
    background: "rgba(255,255,255,0.15)", backdropFilter: "blur(14px)",
    WebkitBackdropFilter: "blur(14px)", border: "1px solid rgba(255,255,255,0.32)",
    borderRadius: 12, cursor: "pointer", boxShadow: "0 4px 18px rgba(0,0,0,0.22)",
    transition: "background 0.2s",
  },
  line: { display: "block", width: 20, height: 2, background: "white", borderRadius: 2 },
  menu: {
    position: "absolute", top: "calc(100% + 8px)", right: 0,
    background: "rgba(30,12,60,0.92)", backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.18)",
    borderRadius: 14, padding: 6, minWidth: 180,
    boxShadow: "0 12px 40px rgba(0,0,0,0.35)",
    display: "flex", flexDirection: "column", gap: 2,
  },
  item: (active) => ({
    background: active ? "rgba(139,92,246,0.35)" : "none",
    border: "none", color: "rgba(255,255,255,0.85)", padding: "10px 16px",
    borderRadius: 9, cursor: "pointer", fontSize: "0.92rem", fontWeight: 600,
    textAlign: "left", transition: "background 0.15s", width: "100%",
  }),
  divider: { height: "1px", background: "rgba(255,255,255,0.1)", margin: "4px 0" },
  userRow: {
    display: "flex", alignItems: "center", gap: "10px",
    padding: "10px 16px",
  },
  avatar: {
    width: 28, height: 28, borderRadius: "50%",
    background: "rgba(139,92,246,0.5)", flexShrink: 0,
    objectFit: "cover",
  },
  userName: { color: "rgba(255,255,255,0.7)", fontSize: "0.82rem", fontWeight: 500 },
  loading: {
    position: "fixed", inset: 0, display: "flex",
    alignItems: "center", justifyContent: "center",
  },
  loadDot: { color: "rgba(255,255,255,0.5)", fontSize: "1rem" },
}

const API = "https://linariaskc.com"
const NOTIF_POLL_MS = 60_000

function NotificationBell({ transitioning, navigate }) {
  const { authFetch } = useAuth()
  const [notifs,    setNotifs]    = useState([])
  const [open,      setOpen]      = useState(false)
  const [justMarked, setJustMarked] = useState(new Set())
  const panelRef    = useRef(null)
  const pollRef     = useRef(null)

  // Fetch notifications
  async function fetchNotifs() {
    try {
      const res  = await authFetch(`${API}/notifications`)
      const data = await res.json()
      setNotifs(data.notifications || [])
    } catch {}
  }

  // Initial fetch + polling
  useEffect(() => {
    fetchNotifs()
    pollRef.current = setInterval(fetchNotifs, NOTIF_POLL_MS)
    return () => clearInterval(pollRef.current)
  }, [])

  // Close panel on outside click
  useEffect(() => {
    function handleClick(e) {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        if (open) closePanel()
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [open])

  function openPanel() {
    // Mark which ones were unread when we opened — these get highlight while panel is open
    const unreadIds = new Set(notifs.filter(n => !n.read).map(n => n.id))
    setJustMarked(unreadIds)
    setOpen(true)
    // Tell backend to mark all as read
    authFetch(`${API}/notifications/read`, { method: "PUT" }).catch(() => {})
    // Optimistically update local state
    setNotifs(ns => ns.map(n => ({ ...n, read: true })))
  }

  function closePanel() {
    setOpen(false)
    setJustMarked(new Set())  // clear highlights when panel closes
  }

  function togglePanel() {
    if (open) closePanel()
    else openPanel()
  }

  const unreadCount = notifs.filter(n => !n.read).length

  function formatNotif(n) {
    try {
      const d   = new Date(n.created_at)
      const hr  = String(d.getUTCHours()).padStart(2, "0")
      const min = String(d.getUTCMinutes()).padStart(2, "0")
      const day = d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" })
      return `Deals search executed at ${hr}:${min} on ${day}`
    } catch {
      return "Deals search executed"
    }
  }

  if (transitioning) return null

  return (
    <div ref={panelRef} style={{ position: "fixed", top: 72, right: 20, zIndex: 200 }}>
      {/* Bell button */}
      <button
        onClick={togglePanel}
        aria-label="Notifications"
        style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          width: 44, height: 44, position: "relative",
          background: open ? "rgba(139,92,246,0.3)" : "rgba(255,255,255,0.15)",
          backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)",
          border: "1px solid rgba(255,255,255,0.32)", borderRadius: 12,
          cursor: "pointer", boxShadow: "0 4px 18px rgba(0,0,0,0.22)",
          transition: "background 0.2s",
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="rgba(255,255,255,0.88)" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2.25a1 1 0 0 1 1 1v.764A7.003 7.003 0 0 1 19 11v4.5l1.707 1.707A1 1 0 0 1 20 19H4a1 1 0 0 1-.707-1.707L5 15.5V11A7.003 7.003 0 0 1 11 4.014V3.25a1 1 0 0 1 1-1Z"/>
          <path d="M10 20h4a2 2 0 0 1-4 0Z"/>
        </svg>
        {unreadCount > 0 && (
          <span style={{
            position: "absolute", top: -5, right: -5,
            background: "#ef4444", color: "white",
            fontSize: "0.65rem", fontWeight: 800,
            borderRadius: "999px", minWidth: 17, height: 17,
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "0 4px", lineHeight: 1,
            boxShadow: "0 2px 6px rgba(0,0,0,0.4)",
          }}>
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 8px)", right: 0,
          width: 300, maxHeight: 380, overflowY: "auto",
          background: "rgba(20,8,48,0.96)", backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.15)",
          borderRadius: 14, padding: "8px 0",
          boxShadow: "0 12px 40px rgba(0,0,0,0.45)",
        }}>
          <p style={{
            color: "rgba(255,255,255,0.5)", fontSize: "0.72rem",
            fontWeight: 700, letterSpacing: "0.5px", textTransform: "uppercase",
            padding: "6px 16px 10px", margin: 0,
          }}>
            Notifications
          </p>

          {notifs.length === 0 ? (
            <p style={{
              color: "rgba(255,255,255,0.35)", fontSize: "0.83rem",
              textAlign: "center", padding: "16px 16px 20px", margin: 0,
            }}>
              No notifications yet
            </p>
          ) : (
            notifs.map(n => {
              const highlight = justMarked.has(n.id)
              return (
                <div
                  key={n.id}
                  onClick={() => { closePanel(); navigate("deals") }}
                  style={{
                    margin: "2px 8px", padding: "10px 12px",
                    borderRadius: 9, cursor: "pointer",
                    background: highlight ? "rgba(139,92,246,0.18)" : "transparent",
                    border: highlight
                      ? "1px solid rgba(139,92,246,0.45)"
                      : "1px solid transparent",
                    transition: "background 0.2s, border 0.2s",
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.07)"}
                  onMouseLeave={e => e.currentTarget.style.background = highlight ? "rgba(139,92,246,0.18)" : "transparent"}
                >
                  <p style={{
                    color: "rgba(255,255,255,0.85)", fontSize: "0.82rem",
                    margin: 0, lineHeight: 1.4,
                  }}>
                    🔍 {formatNotif(n)}
                  </p>
                </div>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}

function NavMenu({ page, navigate, onLogout, user }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false)
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  return (
    <div style={S.wrap} ref={menuRef}>
      <button style={S.btn} onClick={() => setMenuOpen(o => !o)} aria-label="Menu">
        <span style={S.line} /><span style={S.line} /><span style={S.line} />
      </button>
      {menuOpen && (
        <div style={S.menu}>
          {/* User info */}
          <div style={S.userRow}>
            {user?.picture
              ? <img src={user.picture} alt="" style={S.avatar} />
              : <div style={S.avatar} />
            }
            <span style={S.userName}>{user?.name || user?.email || "User"}</span>
          </div>
          <div style={S.divider} />

          <button style={S.item(page === "deals")} onClick={() => { navigate("deals"); setMenuOpen(false) }}>
            ✈️ Deals
          </button>
          <button style={S.item(page === "destinations")} onClick={() => { navigate("destinations"); setMenuOpen(false) }}>
            🌍 Destinations
          </button>
          <button style={S.item(page === "settings")} onClick={() => { navigate("settings"); setMenuOpen(false) }}>
            ⚙️ Settings
          </button>

          <div style={S.divider} />
          <button style={{ ...S.item(false), color: "rgba(239,68,68,0.8)" }} onClick={() => { onLogout(); setMenuOpen(false) }}>
            🚪 Sign out
          </button>
        </div>
      )}
    </div>
  )
}

function AppShell() {
  const { user, logout } = useAuth()
  const [page, setPage]                     = useState("deals")
  const [transitioning, setTransitioning]   = useState(false)
  const [airportVersion, setAirportVersion] = useState(0)
  // "firstVisit" overlay for destinations page when user just activated
  const [showDestOverlay, setShowDestOverlay] = useState(false)

  function navigate(newPage) {
    if (newPage === page) return
    setTransitioning(true)
    setPage(newPage)
    setTimeout(() => setTransitioning(false), 2000)
  }

  // When user just activated (active changed 0→1), navigate to destinations and show overlay
  const prevActiveRef = useRef(null)
  useEffect(() => {
    if (!user) return
    if (prevActiveRef.current === 0 && user.active === 1) {
      // Just activated — go to destinations and show overlay (only if no destinations yet)
      const dests = user.destinations || {}
      if (typeof dests === "object" && Object.keys(dests).length === 0) {
        setPage("destinations")
        setShowDestOverlay(true)
      } else {
        setPage("deals")
      }
    }
    prevActiveRef.current = user.active
  }, [user?.active])

  // Loading
  if (user === undefined) {
    return (
      <div style={S.loading}>
        <p style={S.loadDot}>Loading…</p>
      </div>
    )
  }

  // Not logged in → landing
  if (user === null) return <LandingPage />

  // Logged in but not activated → complete profile
  if (user.active === 0) return <CompleteProfilePage />

  // ── Main app ──────────────────────────────────────────────────────────────
  return (
    <div className="app" style={{
      backgroundImage: "url('/lavender.jpg')", backgroundSize: "cover",
      backgroundPosition: "center", backgroundAttachment: "scroll",
    }}>
      <div className="overlay" />

      {!transitioning && (
        <NavMenu
          page={page}
          navigate={navigate}
          onLogout={logout}
          user={user}
        />
      )}

      <NotificationBell transitioning={transitioning} navigate={navigate} />

      {transitioning && <PlanetLoader />}

      {!transitioning && page === "deals" && (
        <DealsPage airportVersion={airportVersion} />
      )}
      {!transitioning && page === "destinations" && (
        <DestinationsPage
          showFirstVisitOverlay={showDestOverlay}
          onOverlayDismissed={() => setShowDestOverlay(false)}
        />
      )}
      {!transitioning && page === "settings" && (
        <SettingsPage
          onDepartureAirportSaved={() => setAirportVersion(v => v + 1)}
          navigate={navigate}
        />
      )}

      {/* Destinations first-visit overlay */}
      {!transitioning && showDestOverlay && page === "destinations" && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 500,
          background: "rgba(10,4,30,0.75)", backdropFilter: "blur(6px)",
          WebkitBackdropFilter: "blur(6px)",
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "24px",
        }}>
          <div style={{
            background: "rgba(30,12,60,0.97)", border: "1px solid rgba(255,255,255,0.18)",
            borderRadius: "22px", padding: "40px 36px", maxWidth: "400px", width: "100%",
            textAlign: "center", boxShadow: "0 24px 60px rgba(0,0,0,0.5)",
          }}>
            <div style={{ fontSize: "2.4rem", marginBottom: "16px" }}>🌍</div>
            <p style={{ color: "#fff", fontSize: "1.2rem", fontWeight: 800, marginBottom: "10px" }}>
              Welcome to FlightMonitor!
            </p>
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.9rem", lineHeight: 1.6, marginBottom: "28px" }}>
              Use this page to add destinations that interest you. We'll monitor flight prices and alert you when a great deal appears.
            </p>
            <button
              onClick={() => setShowDestOverlay(false)}
              style={{
                padding: "12px 32px", background: "rgba(139,92,246,0.85)",
                border: "none", borderRadius: "12px", color: "white",
                fontSize: "0.95rem", fontWeight: 700, cursor: "pointer",
              }}
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  )
}
