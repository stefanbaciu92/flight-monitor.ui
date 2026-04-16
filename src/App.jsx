import { useState, useRef, useEffect } from "react"
import { AuthProvider, useAuth } from "./context/AuthContext"
import LandingPage from "./pages/LandingPage"
import CompleteProfilePage from "./pages/CompleteProfilePage"
import DealsPage from "./pages/DealsPage"
import DestinationsPage from "./pages/DestinationsPage"
import SettingsPage from "./pages/SettingsPage"
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
  const [airportVersion, setAirportVersion] = useState(0)
  // "firstVisit" overlay for destinations page when user just activated
  const [showDestOverlay, setShowDestOverlay] = useState(false)

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

      <NavMenu
        page={page}
        navigate={setPage}
        onLogout={logout}
        user={user}
      />

      {page === "deals" && (
        <DealsPage airportVersion={airportVersion} />
      )}
      {page === "destinations" && (
        <DestinationsPage
          showFirstVisitOverlay={showDestOverlay}
          onOverlayDismissed={() => setShowDestOverlay(false)}
        />
      )}
      {page === "settings" && (
        <SettingsPage
          onDepartureAirportSaved={() => setAirportVersion(v => v + 1)}
        />
      )}

      {/* Destinations first-visit overlay */}
      {showDestOverlay && page === "destinations" && (
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
