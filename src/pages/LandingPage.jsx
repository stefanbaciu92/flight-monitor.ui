import { useEffect } from "react"
import { useAuth } from "../context/AuthContext"

const API = "https://linariaskc.com"

const S = {
  page: {
    position: "fixed", inset: 0,
    display: "flex", flexDirection: "row",
  },
  left: {
    flex: 1,
    display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center",
    padding: "48px 40px",
    borderRight: "1px solid rgba(255,255,255,0.1)",
  },
  logoWrap: { textAlign: "center", marginBottom: "32px" },
  logoIcon: { fontSize: "3.8rem", marginBottom: "12px" },
  logoName: {
    color: "#fff", fontSize: "2.2rem", fontWeight: 900,
    letterSpacing: "-0.6px", lineHeight: 1,
  },
  logoTagline: {
    color: "rgba(255,255,255,0.55)", fontSize: "0.92rem",
    marginTop: "6px", letterSpacing: "0.1px",
  },
  contentBox: {
    maxWidth: "320px", textAlign: "center",
    color: "rgba(255,255,255,0.45)", fontSize: "0.88rem",
    lineHeight: 1.65,
  },
  pill: {
    display: "inline-block", marginTop: "20px",
    padding: "5px 14px", borderRadius: "50px",
    background: "rgba(139,92,246,0.2)",
    border: "1px solid rgba(139,92,246,0.35)",
    color: "rgba(167,139,250,0.9)", fontSize: "0.78rem", fontWeight: 600,
  },
  right: {
    flex: 1,
    display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center",
    padding: "48px 40px",
  },
  panel: {
    width: "100%", maxWidth: "360px",
  },
  heading: {
    color: "#fff", fontSize: "1.6rem", fontWeight: 800,
    letterSpacing: "-0.3px", marginBottom: "8px", textAlign: "center",
  },
  sub: {
    color: "rgba(255,255,255,0.45)", fontSize: "0.85rem",
    textAlign: "center", marginBottom: "36px",
  },
  providerBtn: (provider) => ({
    width: "100%", display: "flex", alignItems: "center", justifyContent: "center",
    gap: "12px", padding: "13px 20px", borderRadius: "12px", cursor: "pointer",
    fontWeight: 700, fontSize: "0.95rem", border: "none",
    transition: "opacity 0.15s, transform 0.1s",
    background: provider === "google" ? "#fff" : "#1877F2",
    color:      provider === "google" ? "#1f1f1f" : "#fff",
    marginBottom: "12px",
    boxShadow: "0 2px 12px rgba(0,0,0,0.25)",
  }),
  divider: {
    display: "flex", alignItems: "center", gap: "12px",
    margin: "8px 0 20px",
  },
  divLine: {
    flex: 1, height: "1px", background: "rgba(255,255,255,0.12)",
  },
  divText: { color: "rgba(255,255,255,0.3)", fontSize: "0.75rem", fontWeight: 500 },
  terms: {
    color: "rgba(255,255,255,0.3)", fontSize: "0.72rem",
    textAlign: "center", marginTop: "24px", lineHeight: 1.5,
  },
}

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.35-8.16 2.35-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
      <path fill="none" d="M0 0h48v48H0z"/>
    </svg>
  )
}


export default function LandingPage() {
  const { user } = useAuth()

  return (
    <div style={S.page}>
      {/* ── Left half ── */}
      <div style={S.left}>
        <div style={S.logoWrap}>
          <div style={S.logoIcon}>✈️</div>
          <div style={S.logoName}>FlightMonitor</div>
          <div style={S.logoTagline}>Your personal flight deal radar</div>
        </div>
        <div style={S.contentBox}>
          content
          <div style={S.pill}>✨ Free to use</div>
        </div>
      </div>

      {/* ── Right half ── */}
      <div style={S.right}>
        <div style={S.panel}>
          <h2 style={S.heading}>Get started</h2>
          <p style={S.sub}>Sign in to access your personalised flight deals</p>

          <button
            style={S.providerBtn("google")}
            onClick={() => { window.location.href = `${API}/auth/google/login` }}
            onMouseEnter={e => e.currentTarget.style.opacity = "0.9"}
            onMouseLeave={e => e.currentTarget.style.opacity = "1"}
          >
            <GoogleIcon /> Continue with Google
          </button>

          <p style={S.terms}>
            By signing in you agree to our terms of service.<br />
            Your data is used only to personalise your flight alerts.
          </p>
        </div>
      </div>
    </div>
  )
}
