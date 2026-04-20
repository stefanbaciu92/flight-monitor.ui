import { useState, useRef } from "react"
import { useAuth } from "../context/AuthContext"

const API = "https://linariaskc.com"

const CRON_OPTIONS = [
  { value: 1,   label: "Every hour"         },
  { value: 6,   label: "Every 6 hours"      },
  { value: 12,  label: "Every 12 hours"     },
  { value: 24,  label: "Once a day"         },
  { value: 168, label: "Once a week"        },
  { value: 336, label: "Once every 14 days" },
  { value: 720, label: "Once a month"       },
]

const SUB_DAILY   = new Set([1, 6, 12])
const HOUR_OPTIONS = Array.from({ length: 24 }, (_, h) => ({
  value: h,
  label: `${String(h).padStart(2, '0')}:00`,
}))

function localToUtc(localHour) {
  return ((localHour + Math.round(new Date().getTimezoneOffset() / 60)) + 24) % 24
}

const tzLabel = Intl.DateTimeFormat().resolvedOptions().timeZone

const DEAL_CARDS = [
  { top: "4%",  left: "-4%",  rotate: "-8deg",  c1: "#f97316", c2: "#ea580c" },
  { top: "8%",  left: "18%",  rotate: "5deg",   c1: "#3b82f6", c2: "#1d4ed8" },
  { top: "4%",  left: "50%",  rotate: "-3deg",  c1: "#10b981", c2: "#059669" },
  { top: "3%",  left: "78%",  rotate: "7deg",   c1: "#f59e0b", c2: "#d97706" },
  { top: "44%", left: "-6%",  rotate: "4deg",   c1: "#8b5cf6", c2: "#6d28d9" },
  { top: "42%", left: "22%",  rotate: "-6deg",  c1: "#ec4899", c2: "#db2777" },
  { top: "44%", left: "58%",  rotate: "3deg",   c1: "#06b6d4", c2: "#0891b2" },
  { top: "42%", left: "82%",  rotate: "-5deg",  c1: "#84cc16", c2: "#65a30d" },
  { top: "72%", left: "4%",   rotate: "-4deg",  c1: "#f43f5e", c2: "#e11d48" },
  { top: "70%", left: "36%",  rotate: "6deg",   c1: "#6366f1", c2: "#4f46e5" },
  { top: "72%", left: "68%",  rotate: "-3deg",  c1: "#14b8a6", c2: "#0d9488" },
  { top: "70%", left: "88%",  rotate: "5deg",   c1: "#fb923c", c2: "#f97316" },
]

function HazyBackground() {
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", filter: "blur(52px)" }}>
      {DEAL_CARDS.map((c, i) => (
        <div key={i} style={{
          position: "absolute",
          top: c.top, left: c.left,
          width: "240px", height: "150px",
          borderRadius: "18px",
          background: `linear-gradient(140deg, ${c.c1}, ${c.c2})`,
          transform: `rotate(${c.rotate})`,
          opacity: 0.9,
        }} />
      ))}
    </div>
  )
}

const S = {
  card: {
    position: "relative", zIndex: 1,
    background: "rgba(12,4,32,0.82)", backdropFilter: "blur(24px)",
    WebkitBackdropFilter: "blur(24px)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: "24px", padding: "44px 40px",
    maxWidth: "440px", width: "100%",
    boxShadow: "0 24px 60px rgba(0,0,0,0.6)",
  },
  icon: { fontSize: "2.4rem", textAlign: "center", marginBottom: "16px" },
  title: {
    color: "#fff", fontSize: "1.45rem", fontWeight: 800,
    letterSpacing: "-0.3px", marginBottom: "6px", textAlign: "center",
  },
  sub: {
    color: "rgba(255,255,255,0.45)", fontSize: "0.85rem",
    textAlign: "center", lineHeight: 1.5, marginBottom: "32px",
  },
  label: {
    display: "block", fontSize: "0.78rem", fontWeight: 600,
    color: "rgba(255,255,255,0.55)", textTransform: "uppercase",
    letterSpacing: "0.5px", marginBottom: "8px",
  },
  inputWrap: { position: "relative", marginBottom: "24px" },
  input: {
    width: "100%", background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.2)", borderRadius: "12px",
    padding: "12px 44px 12px 14px", color: "white", fontSize: "1rem",
    outline: "none", boxSizing: "border-box", fontFamily: "monospace",
    letterSpacing: "0.5px", textTransform: "uppercase", transition: "border 0.2s",
  },
  inputOk:  { border: "1px solid rgba(52,211,153,0.7)" },
  inputErr: { border: "1px solid rgba(239,68,68,0.7)"  },
  badge: {
    position: "absolute", right: "12px", top: "50%",
    transform: "translateY(-50%)", fontSize: "1rem", lineHeight: 1,
  },
  hint:    { fontSize: "0.75rem", color: "rgba(255,255,255,0.35)", marginTop: "6px" },
  hintOk:  { color: "rgba(52,211,153,0.8)"  },
  hintErr: { color: "rgba(239,68,68,0.8)"   },
  select: {
    width: "100%", background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.2)", borderRadius: "12px",
    padding: "12px 14px", color: "white", fontSize: "0.95rem",
    outline: "none", cursor: "pointer", boxSizing: "border-box",
    marginBottom: "32px",
  },
  btn: (ok) => ({
    width: "100%", padding: "14px",
    background: ok ? "rgba(139,92,246,0.85)" : "rgba(139,92,246,0.35)",
    border: "none", borderRadius: "12px", color: "white",
    fontSize: "0.97rem", fontWeight: 700, cursor: ok ? "pointer" : "not-allowed",
    transition: "background 0.2s",
  }),
  err: {
    marginTop: "14px", padding: "10px 16px", borderRadius: "10px",
    background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)",
    color: "#fca5a5", fontSize: "0.83rem", textAlign: "center",
  },
}

if (!document.getElementById("_cpSpin")) {
  const st = document.createElement("style")
  st.id = "_cpSpin"
  st.textContent = "@keyframes _cpSpin{to{transform:translateY(-50%) rotate(360deg)}}"
  document.head.appendChild(st)
}

function AirportField({ value, onChange, onValidated }) {
  const [status,  setStatus]  = useState("idle")
  const [airName, setAirName] = useState("")
  const debounceRef = useRef(null)
  const minRef      = useRef(null)

  function handleChange(e) {
    const val = e.target.value.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 3)
    onChange(val)
    setStatus("idle")
    setAirName("")
    onValidated(false)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (val.length < 3) return
    debounceRef.current = setTimeout(() => {
      setStatus("loading")
      const apiDone = fetch(`${API}/airports/${val}`)
        .then(r => { if (!r.ok) throw new Error(); return r.json() })
      const minWait = new Promise(r => { minRef.current = r; setTimeout(r, 5000) })
      Promise.all([apiDone, minWait]).then(([info]) => {
        setAirName(`${info.city}, ${info.country} — ${info.name}`)
        setStatus("ok")
        onValidated(val)
      }).catch(() => {
        setStatus("error")
        onValidated(false)
      })
    }, 2000)
  }

  const borderStyle = status === "ok" ? S.inputOk : status === "error" ? S.inputErr : {}
  return (
    <div>
      <label style={S.label}>Departure Airport (IATA code) *</label>
      <div style={S.inputWrap}>
        <input value={value} onChange={handleChange} placeholder="e.g. LTN"
          maxLength={3} style={{ ...S.input, ...borderStyle }} />
        {status === "loading" && <span style={{ ...S.badge, animation: "_cpSpin 0.8s linear infinite" }}>⏳</span>}
        {status === "ok"    && <span style={S.badge}>✅</span>}
        {status === "error" && <span style={S.badge}>❌</span>}
      </div>
      {status === "ok"   && <p style={{ ...S.hint, ...S.hintOk  }}>{airName}</p>}
      {status === "error" && <p style={{ ...S.hint, ...S.hintErr }}>Airport not found. Check the IATA code.</p>}
      {status === "idle" && value.length < 3 && <p style={S.hint}>Enter 3-letter IATA code — we will validate it automatically</p>}
    </div>
  )
}

export default function CompleteProfilePage() {
  const { authFetch, refreshUser, logout } = useAuth()
  const [airport,   setAirport]   = useState("")
  const [validated, setValidated] = useState(false)
  const [cronN,     setCronN]     = useState(720)
  const [cronHour,  setCronHour]  = useState(8)   // local hour
  const [saving,    setSaving]    = useState(false)
  const [error,     setError]     = useState("")
  const [confirmLogout, setConfirmLogout] = useState(false)

  const canSubmit = validated && !saving

  async function handleSubmit() {
    if (!canSubmit) return
    setSaving(true)
    setError("")
    try {
      const res = await authFetch(`${API}/auth/activate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          departure_airport:  validated,
          cron_every_n_hours: cronN,
          cron_hour:          SUB_DAILY.has(cronN) ? null : localToUtc(cronHour),
        }),
      })
      if (!res.ok) throw new Error()
      await refreshUser()
    } catch {
      setError("Something went wrong. Please try again.")
      setSaving(false)
    }
  }

  return (
    <div style={{
      position: "fixed", inset: 0,
      background: "#0f0520",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "24px",
    }}>
      <HazyBackground />
      <div style={{ position: "absolute", inset: 0, background: "rgba(10,3,25,0.45)" }} />

      <div style={S.card}>
        {/* Close button */}
        <button
          onClick={() => setConfirmLogout(true)}
          style={{
            position: "absolute", top: "16px", right: "16px",
            background: "rgba(255,255,255,0.08)", border: "none",
            borderRadius: "8px", color: "rgba(255,255,255,0.5)",
            width: "32px", height: "32px", cursor: "pointer",
            fontSize: "1.1rem", display: "flex", alignItems: "center",
            justifyContent: "center", transition: "background 0.15s",
          }}
          onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.15)"}
          onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.08)"}
        >✕</button>

        {!confirmLogout ? (
          <>
            <div style={S.icon}>🛫</div>
            <h2 style={S.title}>Complete your profile</h2>
            <p style={S.sub}>Set up your departure airport and how often you want to receive flight deal alerts.</p>

            <AirportField value={airport} onChange={setAirport} onValidated={setValidated} />

            <label style={{ ...S.label, marginBottom: "8px", display: "block", marginTop: "4px" }}>
              Deal alert frequency *
            </label>
            <select value={cronN} onChange={e => setCronN(Number(e.target.value))} style={S.select}>
              {CRON_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>

            {!SUB_DAILY.has(cronN) && (
              <>
                <label style={{ ...S.label, marginBottom: "8px", display: "block" }}>
                  Time of day *
                </label>
                <select
                  value={cronHour}
                  onChange={e => setCronHour(Number(e.target.value))}
                  style={S.select}
                >
                  {HOUR_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
                <p style={{ ...S.hint, marginTop: "-20px", marginBottom: "24px" }}>
                  Your local time ({tzLabel})
                </p>
              </>
            )}

            <button style={S.btn(canSubmit)} onClick={handleSubmit} disabled={!canSubmit}>
              {saving ? "Saving..." : "Continue →"}
            </button>

            {error && <div style={S.err}>{error}</div>}
          </>
        ) : (
          <>
            <div style={{ fontSize: "2.4rem", textAlign: "center", marginBottom: "16px" }}>⚠️</div>
            <h2 style={S.title}>Are you sure?</h2>
            <p style={{ ...S.sub, marginBottom: "32px" }}>
              Closing will log you out of the current session. Are you sure you want to log out?
            </p>

            <button
              onClick={() => setConfirmLogout(false)}
              style={{
                ...S.btn(true),
                background: "rgba(139,92,246,0.85)",
                marginBottom: "12px",
              }}
            >
              Continue completing
            </button>

            <button
              onClick={() => { logout(); window.location.href = "/" }}
              style={{
                ...S.btn(true),
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.15)",
                color: "rgba(255,255,255,0.65)",
                fontWeight: 500,
              }}
            >
              Log out
            </button>
          </>
        )}
      </div>
    </div>
  )
}
