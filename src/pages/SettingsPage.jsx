import { useState, useEffect, useRef } from "react"
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
  page: {
    position: "relative", zIndex: 1, minHeight: "100vh",
    padding: "40px 28px 70px", maxWidth: "600px", margin: "0 auto",
  },
  header: { textAlign: "center", paddingTop: "56px", marginBottom: "36px" },
  h2: { color: "#fff", fontSize: "2rem", fontWeight: 800, textShadow: "0 2px 18px rgba(0,0,0,0.45)", letterSpacing: "-0.4px" },
  subtitle: { color: "rgba(255,255,255,0.65)", fontSize: "0.86rem", marginTop: "8px" },
  card: {
    background: "rgba(255,255,255,0.08)", backdropFilter: "blur(18px)",
    WebkitBackdropFilter: "blur(18px)", border: "1px solid rgba(255,255,255,0.15)",
    borderRadius: "18px", padding: "28px", marginBottom: "16px",
    boxShadow: "0 4px 24px rgba(0,0,0,0.18)",
  },
  sectionTitle: { color: "rgba(255,255,255,0.9)", fontSize: "0.92rem", fontWeight: 700, marginBottom: "16px" },
  label: {
    display: "block", fontSize: "0.78rem", fontWeight: 600,
    color: "rgba(255,255,255,0.55)", textTransform: "uppercase",
    letterSpacing: "0.5px", marginBottom: "8px",
  },
  input: {
    width: "100%", background: "rgba(255,255,255,0.1)",
    border: "1px solid rgba(255,255,255,0.22)", borderRadius: "10px",
    padding: "10px 14px", color: "white", fontSize: "0.95rem",
    outline: "none", boxSizing: "border-box",
  },
  inputMono: { fontFamily: "monospace", letterSpacing: "0.5px" },
  select: {
    width: "100%", background: "rgba(255,255,255,0.1)",
    border: "1px solid rgba(255,255,255,0.22)", borderRadius: "10px",
    padding: "10px 14px", color: "white", fontSize: "0.92rem",
    outline: "none", cursor: "pointer", boxSizing: "border-box",
  },
  saveBtn: (disabled) => ({
    width: "100%", padding: "13px",
    background: disabled ? "rgba(139,92,246,0.4)" : "rgba(139,92,246,0.8)",
    border: "none", borderRadius: "12px", color: "white",
    fontSize: "0.95rem", fontWeight: 700, cursor: disabled ? "not-allowed" : "pointer",
    transition: "background 0.2s", marginTop: "8px",
  }),
  toast: (type) => ({
    marginTop: "12px", padding: "10px 16px", borderRadius: "10px",
    fontSize: "0.85rem", textAlign: "center", fontWeight: 500,
    background: type === "ok" ? "rgba(134,239,172,0.15)" : "rgba(239,68,68,0.15)",
    border: type === "ok" ? "1px solid rgba(134,239,172,0.35)" : "1px solid rgba(239,68,68,0.35)",
    color: type === "ok" ? "#86efac" : "#fca5a5",
  }),
  fieldWrap: { marginBottom: "20px" },
  hint: { fontSize: "0.75rem", color: "rgba(255,255,255,0.38)", marginTop: "8px" },
  hintOk:  { color: "rgba(52,211,153,0.8)"  },
  hintErr: { color: "rgba(239,68,68,0.7)"   },
  badge: {
    position: "absolute", right: "12px", top: "50%",
    transform: "translateY(-50%)", fontSize: "1rem", lineHeight: 1,
  },
  inputWrap: { position: "relative" },
}

// Inject spinner keyframe once
if (!document.getElementById("_settSpin")) {
  const st = document.createElement("style")
  st.id    = "_settSpin"
  st.textContent = "@keyframes _settSpin{to{transform:translateY(-50%) rotate(360deg)}}"
  document.head.appendChild(st)
}

function DepartureAirportField({ savedValue, onValidated, onSaved }) {
  const { authFetch } = useAuth()
  const [value,      setValue]      = useState("")
  const [status,     setStatus]     = useState("idle")
  const [airName,    setAirName]    = useState("")
  const [saveStatus, setSaveStatus] = useState("idle")
  const debounceRef  = useRef(null)
  const isFirstRender = useRef(true)

  useEffect(() => {
    if (isFirstRender.current && savedValue) {
      setValue(savedValue)
      isFirstRender.current = false
    }
  }, [savedValue])

  function handleFocus() {
    setValue("")
    setStatus("idle")
    setAirName("")
    setSaveStatus("idle")
    onValidated(false)
  }

  function handleChange(e) {
    const val = e.target.value.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 3)
    setValue(val)
    setStatus("idle")
    setAirName("")
    setSaveStatus("idle")
    onValidated(false)

    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (val.length < 3) return

    debounceRef.current = setTimeout(async () => {
      setStatus("loading")
      try {
        const [info] = await Promise.all([
          fetch(`${API}/airports/${val}`).then(r => { if (!r.ok) throw new Error(); return r.json() }),
          new Promise(r => setTimeout(r, 5000)),
        ])
        setAirName(`${info.city}, ${info.country} — ${info.name}`)
        setStatus("ok")
        onValidated(val)

        // Auto-save
        setSaveStatus("saving")
        const res = await authFetch(`${API}/settings`, {
          method:  "PUT",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({ departure_airport: val }),
        })
        if (!res.ok) throw new Error()
        setSaveStatus("saved")
        if (onSaved) onSaved(val)
      } catch {
        if (status !== "saving") {
          setStatus("error")
          setValue("")
        }
        setSaveStatus("idle")
        onValidated(false)
      }
    }, 2000)
  }

  const borderStyle =
    status === "ok"    ? { border: "1px solid rgba(52,211,153,0.7)" } :
    status === "error" ? { border: "1px solid rgba(239,68,68,0.7)"  } : {}

  return (
    <div style={S.fieldWrap}>
      <label style={S.label}>Departure Airport</label>
      <div style={S.inputWrap}>
        <input
          value={value}
          onFocus={handleFocus}
          onChange={handleChange}
          placeholder={savedValue || "e.g. LTN"}
          maxLength={3}
          style={{ ...S.input, ...S.inputMono, ...borderStyle }}
        />
        {status === "loading" && (
          <span style={{ ...S.badge, animation: "_settSpin 0.8s linear infinite" }}>⏳</span>
        )}
        {status === "ok"    && <span style={S.badge}>✅</span>}
        {status === "error" && <span style={S.badge}>❌</span>}
      </div>
      {status === "ok" && saveStatus === "saved" && (
        <p style={{ ...S.hint, ...S.hintOk }}>✓ {airName} — saved</p>
      )}
      {status === "ok" && saveStatus === "saving" && (
        <p style={{ ...S.hint, ...S.hintOk }}>✓ {airName} — saving...</p>
      )}
      {status === "ok" && saveStatus === "idle" && (
        <p style={{ ...S.hint, ...S.hintOk }}>✓ {airName}</p>
      )}
      {status === "error" && (
        <p style={{ ...S.hint, ...S.hintErr }}>Unable to find departure airport</p>
      )}
      {status === "idle" && (
        <p style={S.hint}>
          {savedValue ? `Current: ${savedValue} — click to change` : "Enter 3-letter IATA code, we'll validate automatically"}
        </p>
      )}
    </div>
  )
}

export default function SettingsPage({ onDepartureAirportSaved }) {
  const { authFetch, refreshUser } = useAuth()
  const [settings, setSettings]   = useState(null)
  const [botToken, setBotToken]   = useState("")
  const [chatId,   setChatId]     = useState("")
  const [cronN,    setCronN]      = useState(720)
  const [dirty,    setDirty]      = useState(false)
  const [saving,   setSaving]     = useState(false)
  const [toast,    setToast]      = useState(null)

  useEffect(() => {
    authFetch(`${API}/settings`)
      .then(r => r.json())
      .then(s => {
        setSettings(s)
        setBotToken(s.bot_token  || "")
        setChatId(s.chat_id      || "")
        setCronN(s.cron_every_n_hours || 3)
      })
      .catch(() => {})
  }, [])

  async function handleSave() {
    setSaving(true)
    setToast(null)
    try {
      const res = await authFetch(`${API}/settings`, {
        method:  "PUT",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          bot_token:          botToken,
          chat_id:            chatId,
          cron_every_n_hours: cronN,
        }),
      })
      if (!res.ok) throw new Error()
      setToast({ type: "ok", text: "Settings saved" })
      setDirty(false)
      await refreshUser()
    } catch {
      setToast({ type: "err", text: "Failed to save settings" })
    } finally {
      setSaving(false)
    }
  }

  if (!settings) {
    return (
      <div style={S.page}>
        <div style={S.header}><h2 style={S.h2}>Settings</h2></div>
        <p style={{ color: "rgba(255,255,255,0.4)", textAlign: "center" }}>Loading…</p>
      </div>
    )
  }

  return (
    <div style={S.page}>
      <div style={S.header}>
        <h2 style={S.h2}>Settings</h2>
        <p style={S.subtitle}>Manage your departure airport, Telegram alerts and search frequency</p>
      </div>

      {/* Departure airport */}
      <div style={S.card}>
        <p style={S.sectionTitle}>✈️ Departure Airport</p>
        <DepartureAirportField
          savedValue={settings.departure_airport}
          onValidated={() => {}}
          onSaved={(iata) => {
            setSettings(s => ({ ...s, departure_airport: iata }))
            if (onDepartureAirportSaved) onDepartureAirportSaved(iata)
          }}
        />
      </div>

      {/* Telegram */}
      <div style={S.card}>
        <p style={S.sectionTitle}>📱 Telegram Alerts</p>
        <div style={S.fieldWrap}>
          <label style={S.label}>Bot Token</label>
          <input
            value={botToken}
            onChange={e => { setBotToken(e.target.value); setDirty(true) }}
            placeholder="8607139593:AAH3kwe05ObKVeE6..."
            style={{ ...S.input, ...S.inputMono }}
          />
          <p style={S.hint}>Get this from @BotFather on Telegram</p>
        </div>
        <div style={S.fieldWrap}>
          <label style={S.label}>Chat ID</label>
          <input
            value={chatId}
            onChange={e => { setChatId(e.target.value); setDirty(true) }}
            placeholder="8722051267"
            style={{ ...S.input, ...S.inputMono }}
          />
          <p style={S.hint}>Message your bot then visit api.telegram.org/bot&lt;TOKEN&gt;/getUpdates to find your chat ID</p>
        </div>
      </div>

      {/* Search frequency */}
      <div style={S.card}>
        <p style={S.sectionTitle}>🕐 Deal Search Frequency</p>
        <label style={S.label}>Check for deals</label>
        <select
          value={cronN}
          onChange={e => { setCronN(Number(e.target.value)); setDirty(true) }}
          style={S.select}
        >
          {CRON_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <p style={{ ...S.hint, marginTop: "12px" }}>
          The monitor will automatically search for deals on this schedule
        </p>
      </div>

      <button
        style={S.saveBtn(!dirty || saving)}
        onClick={handleSave}
        disabled={!dirty || saving}
      >
        {saving ? "Saving..." : "Save Changes"}
      </button>

      {toast && <div style={S.toast(toast.type)}>{toast.text}</div>}
    </div>
  )
}
