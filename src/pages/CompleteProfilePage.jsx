import { useState, useRef, useEffect } from "react"
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

const S = {
  wrap: {
    position: "fixed", inset: 0,
    display: "flex", alignItems: "center", justifyContent: "center",
    padding: "24px",
  },
  card: {
    background: "rgba(20,8,48,0.92)", backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    border: "1px solid rgba(255,255,255,0.15)",
    borderRadius: "24px", padding: "44px 40px",
    maxWidth: "440px", width: "100%",
    boxShadow: "0 24px 60px rgba(0,0,0,0.55)",
  },
  icon: { fontSize: "2.6rem", textAlign: "center", marginBottom: "16px" },
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
    letterSpacing: "0.5px", textTransform: "uppercase",
    transition: "border 0.2s",
  },
  inputOk:  { border: "1px solid rgba(52,211,153,0.7)" },
  inputErr: { border: "1px solid rgba(239,68,68,0.7)"  },
  badge: {
    position: "absolute", right: "12px", top: "50%",
    transform: "translateY(-50%)", fontSize: "1rem", lineHeight: 1,
  },
  hint: { fontSize: "0.75rem", color: "rgba(255,255,255,0.35)", marginTop: "6px" },
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

// Keyframe injection for spinner
if (!document.getElementById("_cpSpin")) {
  const st = document.createElement("style")
  st.id    = "_cpSpin"
  st.textContent = "@keyframes _cpSpin{to{transform:translateY(-50%) rotate(360deg)}}"
  document.head.appendChild(st)
}

function AirportField({ value, onChange, onValidated }) {
  const [status,  setStatus]  = useState("idle")   // idle | loading | ok | error
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
        <input
          value={value}
          onChange={handleChange}
          placeholder="e.g. LTN"
          maxLength={3}
          style={{ ...S.input, ...borderStyle }}
        />
        {status === "loading" && (
          <span style={{ ...S.badge, animation: "_cpSpin 0.8s linear infinite" }}>⏳</span>
        )}
        {status === "ok"    && <span style={S.badge}>✅</span>}
        {status === "error" && <span style={S.badge}>❌</span>}
      </div>
      {status === "ok"    && <p style={{ ...S.hint, ...S.hintOk  }}>{airName}</p>}
      {status === "error" && <p style={{ ...S.hint, ...S.hintErr }}>Airport not found. Check the IATA code.</p>}
      {status === "idle"  && value.length < 3 && (
        <p style={S.hint}>Enter 3-letter IATA code — we'll validate it automatically</p>
      )}
    </div>
  )
}

export default function CompleteProfilePage() {
  const { authFetch, refreshUser } = useAuth()
  const [airport,   setAirport]   = useState("")
  const [validated, setValidated] = useState(false)   // false or "LTN"
  const [cronN,     setCronN]     = useState(720)
  const [saving,    setSaving]    = useState(false)
  const [error,     setError]     = useState("")

  const canSubmit = validated && !saving

  async function handleSubmit() {
    if (!canSubmit) return
    setSaving(true)
    setError("")
    try {
      const res = await authFetch(`${API}/auth/activate`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ departure_airport: validated, cron_every_n_hours: cronN }),
      })
      if (!res.ok) throw new Error("Failed to save profile")
      await refreshUser()
      // App.jsx will redirect to destinations after refreshUser sets user.active = 1
    } catch (err) {
      setError("Something went wrong. Please try again.")
      setSaving(false)
    }
  }

  return (
    <div style={S.wrap}>
      <div style={S.card}>
        <div style={S.icon}>🛫</div>
        <h2 style={S.title}>Complete your profile</h2>
        <p style={S.sub}>
          Set up your departure airport and how often you want to receive flight deal alerts.
        </p>

        <AirportField
          value={airport}
          onChange={setAirport}
          onValidated={setValidated}
        />

        <label style={{ ...S.label, marginBottom: "8px", display: "block", marginTop: "4px" }}>
          Deal alert frequency *
        </label>
        <select
          value={cronN}
          onChange={e => setCronN(Number(e.target.value))}
          style={S.select}
        >
          {CRON_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>

        <button style={S.btn(canSubmit)} onClick={handleSubmit} disabled={!canSubmit}>
          {saving ? "Saving..." : "Continue →"}
        </button>

        {error && <div style={S.err}>{error}</div>}
      </div>
    </div>
  )
}
