import { useState, useEffect, useRef } from "react"
import { useAuth } from "../context/AuthContext"
import PlanetLoader from "../components/PlanetLoader"

const API = "https://linariaskc.com"

// ─── Cron / time helpers ───────────────────────────────────────────────────────

const CRON_OPTIONS = [
  { label: "Every hour",       value: "0 * * * *"   },
  { label: "Every 2 hours",    value: "0 */2 * * *"  },
  { label: "Every 3 hours",    value: "0 */3 * * *"  },
  { label: "Every 6 hours",    value: "0 */6 * * *"  },
  { label: "Every 12 hours",   value: "0 */12 * * *" },
  { label: "Once a day",       value: "0 9 * * *"    },
  { label: "Twice a day",      value: "0 9,21 * * *" },
]

const SUB_DAILY = ["0 9 * * *", "0 9,21 * * *"]

const HOUR_OPTIONS = Array.from({ length: 24 }, (_, i) => ({
  value: i,
  label: `${String(i).padStart(2, "0")}:00`,
}))

function localToUtc(localHour) {
  const d = new Date()
  d.setHours(localHour, 0, 0, 0)
  return d.getUTCHours()
}

function utcToLocal(utcHour) {
  const d = new Date()
  d.setUTCHours(utcHour, 0, 0, 0)
  return d.getHours()
}

function tzLabel() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone
}

// ─── Style constants ───────────────────────────────────────────────────────────

const S = {
  page: {
    minHeight: "100vh",
    padding: "32px 16px 80px",
    maxWidth: 560,
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    gap: 24,
  },
  heading: {
    fontSize: "1.6rem",
    fontWeight: 700,
    color: "#ffffff",
    margin: "0 0 4px",
  },
  subheading: {
    fontSize: "0.85rem",
    color: "#ffffff",
    margin: 0,
  },
  card: {
    background: "rgba(255,255,255,0.08)",
    backdropFilter: "blur(18px)",
    WebkitBackdropFilter: "blur(18px)",
    borderRadius: 18,
    padding: "24px 22px",
    border: "1px solid rgba(255,255,255,0.1)",
  },
  cardTitle: {
    fontSize: "0.78rem",
    fontWeight: 700,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: "rgba(139,92,246,0.9)",
    margin: "0 0 16px",
  },
  label: {
    fontSize: "0.82rem",
    color: "rgba(255,255,255,0.55)",
    marginBottom: 6,
    display: "block",
  },
  input: {
    width: "100%",
    boxSizing: "border-box",
    background: "rgba(255,255,255,0.07)",
    border: "1px solid rgba(255,255,255,0.15)",
    borderRadius: 10,
    padding: "10px 14px",
    color: "rgba(255,255,255,0.9)",
    fontSize: "0.92rem",
    outline: "none",
  },
  select: {
    width: "100%",
    boxSizing: "border-box",
    background: "rgba(20,8,48,0.9)",
    border: "1px solid rgba(255,255,255,0.15)",
    borderRadius: 10,
    padding: "10px 14px",
    color: "rgba(255,255,255,0.9)",
    fontSize: "0.92rem",
    outline: "none",
    cursor: "pointer",
  },
  btn: {
    width: "100%",
    padding: "13px",
    borderRadius: 12,
    border: "none",
    background: "rgba(139,92,246,0.8)",
    color: "#fff",
    fontSize: "0.95rem",
    fontWeight: 700,
    cursor: "pointer",
    letterSpacing: "0.02em",
  },
  hint: {
    fontSize: "0.75rem",
    color: "rgba(255,255,255,0.38)",
    marginTop: 6,
  },
  divider: {
    height: 1,
    background: "rgba(255,255,255,0.07)",
    margin: "18px 0",
  },
  row: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  subtitle: {
    fontSize: "0.82rem",
    color: "rgba(255,255,255,0.55)",
    margin: "0 0 12px",
  },
  toggleRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  toggleLabel: {
    fontSize: "0.88rem",
    color: "rgba(255,255,255,0.8)",
  },
  toggle: (on) => ({
    width: 42,
    height: 24,
    borderRadius: 12,
    background: on ? "rgba(139,92,246,0.8)" : "rgba(255,255,255,0.15)",
    border: "none",
    cursor: "pointer",
    position: "relative",
    transition: "background 0.2s",
    flexShrink: 0,
  }),
  toggleKnob: (on) => ({
    position: "absolute",
    top: 3,
    left: on ? 21 : 3,
    width: 18,
    height: 18,
    borderRadius: "50%",
    background: "#fff",
    transition: "left 0.2s",
  }),
  toast: (type) => ({
    position: "fixed",
    bottom: 28,
    left: "50%",
    transform: "translateX(-50%)",
    background: type === "ok" ? "rgba(16,185,129,0.92)" : "rgba(239,68,68,0.92)",
    color: "#fff",
    padding: "10px 22px",
    borderRadius: 12,
    fontWeight: 600,
    fontSize: "0.88rem",
    zIndex: 999,
    boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
    pointerEvents: "none",
  }),
}

// ─── DepartureAirportField ─────────────────────────────────────────────────────

function DepartureAirportField({ value, authFetch, onSaved }) {
  const [draft, setDraft]   = useState(value || "")
  const [status, setStatus] = useState(null) // null | "saving" | "ok" | "err"
  const [errMsg, setErrMsg] = useState("")
  const timerRef            = useRef(null)

  useEffect(() => { setDraft(value || "") }, [value])

  function handleChange(e) {
    const raw = e.target.value.toUpperCase().slice(0, 4)
    setDraft(raw)
    setStatus(null)
    clearTimeout(timerRef.current)
    if (raw.length === 3) {
      timerRef.current = setTimeout(() => autoSave(raw), 700)
    }
  }

  async function autoSave(iata) {
    setStatus("saving")
    try {
      const res = await authFetch(`${API}/settings/validate-airport`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ iata }),
      })
      const data = await res.json()
      if (!res.ok || !data.valid) {
        setStatus("err")
        setErrMsg(data.detail || "Unknown airport code")
        return
      }
      await authFetch(`${API}/settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ departure_airport: iata }),
      })
      setStatus("ok")
      if (onSaved) onSaved(iata)
    } catch {
      setStatus("err")
      setErrMsg("Could not validate airport")
    }
  }

  return (
    <div>
      <label style={S.label}>Departure airport (IATA code)</label>
      <div style={{ position: "relative" }}>
        <input
          value={draft}
          onChange={handleChange}
          placeholder="e.g. LHR"
          maxLength={3}
          style={{
            ...S.input,
            fontFamily: "monospace",
            fontSize: "1.05rem",
            letterSpacing: "0.1em",
            borderColor:
              status === "err" ? "rgba(239,68,68,0.6)"
              : status === "ok"  ? "rgba(16,185,129,0.6)"
              : "rgba(255,255,255,0.15)",
          }}
        />
        {status === "saving" && (
          <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", fontSize: "0.75rem", color: "rgba(255,255,255,0.4)" }}>
            saving…
          </span>
        )}
        {status === "ok" && (
          <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: "rgba(16,185,129,0.9)", fontSize: "0.85rem" }}>
            ✓
          </span>
        )}
      </div>
      {status === "err" && (
        <p style={{ ...S.hint, color: "rgba(239,68,68,0.85)", marginTop: 5 }}>{errMsg}</p>
      )}
      {status === "ok" && (
        <p style={{ ...S.hint, color: "rgba(16,185,129,0.8)", marginTop: 5 }}>Airport saved ✓</p>
      )}
      {!status && (
        <p style={S.hint}>3-letter IATA code — saved automatically</p>
      )}
    </div>
  )
}

// ─── TgMockupSearch ────────────────────────────────────────────────────────────

function TgMockupSearch() {
  return (
    <div style={{
      background: "#1c2733",
      borderRadius: 14,
      maxWidth: 260,
      margin: "12px auto",
      overflow: "hidden",
      boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
    }}>
      {/* Search bar area */}
      <div style={{
        background: "#17212b",
        padding: "8px 12px",
        display: "flex",
        alignItems: "center",
        gap: 8,
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}>
        <span style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.85rem" }}>🔍</span>
        <span style={{
          flex: 1,
          background: "rgba(255,255,255,0.08)",
          borderRadius: 8,
          padding: "5px 10px",
          fontSize: "0.82rem",
          color: "rgba(255,255,255,0.85)",
          fontFamily: "monospace",
        }}>
          @BotFather
        </span>
      </div>

      {/* Result row */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 12px",
      }}>
        <div style={{
          width: 38,
          height: 38,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #2196f3, #1565c0)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "1.1rem",
          flexShrink: 0,
        }}>
          🤖
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ fontSize: "0.88rem", fontWeight: 600, color: "rgba(255,255,255,0.92)" }}>
              BotFather
            </span>
            <span style={{ fontSize: "0.65rem", color: "#2196f3", fontWeight: 700 }}>✔</span>
          </div>
          <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.4)", marginTop: 1 }}>
            Telegram
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── TgMockupToken ─────────────────────────────────────────────────────────────

function TgMockupToken() {
  return (
    <div style={{
      background: "#1c2733",
      borderRadius: 14,
      maxWidth: 300,
      margin: "12px auto",
      overflow: "hidden",
      boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
    }}>
      {/* Header */}
      <div style={{
        background: "#17212b",
        padding: "8px 12px",
        display: "flex",
        alignItems: "center",
        gap: 8,
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}>
        <div style={{
          width: 26,
          height: 26,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #2196f3, #1565c0)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "0.75rem",
          flexShrink: 0,
        }}>
          🤖
        </div>
        <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "rgba(255,255,255,0.9)" }}>
          BotFather
        </span>
      </div>

      {/* Chat bubble */}
      <div style={{ padding: "10px 12px" }}>
        <div style={{
          background: "#2b5278",
          borderRadius: "4px 12px 12px 12px",
          padding: "10px 12px",
        }}>
          <p style={{
            margin: "0 0 8px",
            fontSize: "0.78rem",
            color: "rgba(255,255,255,0.85)",
            lineHeight: 1.45,
          }}>
            Done! Congratulations on your new bot. You will find it at t.me/YourBot. Use this token to access the HTTP API:
          </p>

          {/* Code block */}
          <div style={{
            background: "rgba(0,0,0,0.3)",
            borderRadius: 6,
            padding: "7px 10px",
            marginBottom: 8,
          }}>
            <code style={{
              fontSize: "0.7rem",
              color: "#facc15",
              fontFamily: "monospace",
              wordBreak: "break-all",
            }}>
              7412938475:AAHdqTcvCH1vGWJxfSeofSs4tLuWQLZauE
            </code>
          </div>

          <p style={{
            margin: 0,
            fontSize: "0.68rem",
            color: "rgba(255,255,255,0.45)",
            lineHeight: 1.4,
          }}>
            Keep your token secure and store it safely, it can be used by anyone to control your bot.
          </p>
        </div>
      </div>
    </div>
  )
}

// ─── TelegramSetupModal ────────────────────────────────────────────────────────

function TelegramSetupModal({ onClose, onCancel, onComplete, initialToken }) {
  const { authFetch } = useAuth()
  const [step, setStep]             = useState(1)
  const [platform, setPlatform]     = useState("ios")
  const [token, setToken]           = useState(initialToken || "")
  const [tokenSaved, setTokenSaved] = useState(false)
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState(null)
  const debounceRef                 = useRef(null)

  // Auto-save token with debounce
  useEffect(() => {
    if (token.length < 25) return
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await authFetch(`${API}/settings`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ bot_token: token }),
        })
        if (res.ok) setTokenSaved(true)
      } catch {
        // silent
      }
    }, 600)
    return () => clearTimeout(debounceRef.current)
  }, [token])

  async function handleConfirm() {
    setLoading(true)
    try {
      const res  = await authFetch(`${API}/telegram/fetch-chat-id`)
      const data = await res.json()
      if (res.ok) {
        onComplete(data.chat_id)
      } else {
        setError(data.detail || "Something went wrong")
        setLoading(false)
      }
    } catch {
      setError("Something went wrong")
      setLoading(false)
    }
  }

  function handleXClick() {
    if (error) {
      onCancel()
    } else {
      onClose()
    }
  }

  const qrUrl =
    platform === "ios"
      ? "https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=https://apps.apple.com/app/telegram-messenger/id686449807"
      : "https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=https://play.google.com/store/apps/details?id=org.telegram.messenger"

  const storeLabel = platform === "ios" ? "App Store" : "Google Play"

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      zIndex: 500,
      background: "rgba(10,4,30,0.82)",
      backdropFilter: "blur(8px)",
      WebkitBackdropFilter: "blur(8px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "16px",
    }}>
      {loading && (
        <div style={{ position: "fixed", inset: 0, zIndex: 1000 }}>
          <PlanetLoader />
        </div>
      )}

      <div style={{
        background: "rgba(20,8,48,0.97)",
        border: "1px solid rgba(255,255,255,0.15)",
        borderRadius: 20,
        padding: "32px 28px",
        width: "100%",
        maxWidth: 460,
        maxHeight: "88vh",
        overflowY: "auto",
        position: "relative",
      }}>
        {/* X close button */}
        <button
          onClick={handleXClick}
          aria-label="Close"
          style={{
            position: "absolute",
            top: 16,
            right: 18,
            background: "none",
            border: "none",
            color: "rgba(255,255,255,0.5)",
            fontSize: "1.2rem",
            cursor: "pointer",
            lineHeight: 1,
            padding: 4,
          }}
        >
          ✕
        </button>

        {/* Step progress dots */}
        <div style={{
          display: "flex",
          justifyContent: "center",
          gap: 6,
          marginBottom: 24,
        }}>
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: step >= s ? "rgba(139,92,246,0.9)" : "rgba(255,255,255,0.2)",
                transition: "background 0.2s",
              }}
            />
          ))}
        </div>

        {/* ── Error state ── */}
        {error !== null ? (
          <div>
            <div style={{
              background: "rgba(239,68,68,0.12)",
              border: "1px solid rgba(239,68,68,0.35)",
              borderRadius: 12,
              padding: "16px",
              marginBottom: 24,
            }}>
              <p style={{ margin: 0, color: "rgba(239,68,68,0.9)", fontWeight: 600, fontSize: "0.88rem" }}>
                {error}
              </p>
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <button
                onClick={() => {
                  setError(null)
                  setToken("")
                  setTokenSaved(false)
                  setStep(1)
                }}
                style={{
                  flex: 1,
                  padding: "12px",
                  borderRadius: 12,
                  border: "1px solid rgba(255,255,255,0.2)",
                  background: "rgba(255,255,255,0.07)",
                  color: "rgba(255,255,255,0.85)",
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                ← Try Again
              </button>
              <button
                onClick={onCancel}
                style={{
                  flex: 1,
                  padding: "12px",
                  borderRadius: 12,
                  border: "1px solid rgba(239,68,68,0.4)",
                  background: "rgba(239,68,68,0.15)",
                  color: "rgba(239,68,68,0.9)",
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
            </div>
          </div>

        ) : step === 1 ? (
          /* ── Step 1: Install Telegram ── */
          <div>
            <h2 style={{
              fontSize: "1.05rem",
              fontWeight: 700,
              color: "rgba(255,255,255,0.95)",
              margin: "0 0 20px",
              textAlign: "center",
            }}>
              Step 1 — Install Telegram on your phone
            </h2>

            {/* Platform toggle */}
            <div style={{
              display: "flex",
              background: "rgba(255,255,255,0.06)",
              borderRadius: 10,
              padding: 3,
              marginBottom: 22,
              gap: 3,
            }}>
              {[
                { key: "ios",     label: "🍎 iPhone"  },
                { key: "android", label: "🤖 Android" },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setPlatform(key)}
                  style={{
                    flex: 1,
                    padding: "8px 12px",
                    borderRadius: 8,
                    border: "none",
                    background: platform === key ? "rgba(139,92,246,0.8)" : "transparent",
                    color: platform === key ? "#fff" : "rgba(255,255,255,0.55)",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "background 0.18s, color 0.18s",
                  }}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* QR code */}
            <div style={{ textAlign: "center", marginBottom: 8 }}>
              <img
                src={qrUrl}
                alt="Download QR code"
                width={180}
                height={180}
                style={{
                  background: "#fff",
                  padding: 8,
                  borderRadius: 12,
                  display: "inline-block",
                }}
              />
              <p style={{
                fontSize: "0.78rem",
                color: "rgba(255,255,255,0.45)",
                margin: "10px 0 0",
              }}>
                Scan to download from {storeLabel}
              </p>
            </div>

            <div style={{ height: 24 }} />

            <button onClick={() => setStep(2)} style={{ ...S.btn, marginTop: 4 }}>
              Next Step →
            </button>
          </div>

        ) : step === 2 ? (
          /* ── Step 2: Create bot with BotFather ── */
          <div>
            <h2 style={{
              fontSize: "1.05rem",
              fontWeight: 700,
              color: "rgba(255,255,255,0.95)",
              margin: "0 0 20px",
              textAlign: "center",
            }}>
              Step 2 — Create a bot with @BotFather
            </h2>

            <ol style={{ listStyle: "none", padding: 0, margin: "0 0 20px" }}>
              {/* Instruction 1 */}
              <li style={{ display: "flex", gap: 12, marginBottom: 18, alignItems: "flex-start" }}>
                <div style={{
                  width: 22,
                  height: 22,
                  borderRadius: "50%",
                  background: "rgba(139,92,246,0.8)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  color: "#fff",
                  flexShrink: 0,
                  marginTop: 1,
                }}>
                  1
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: "0 0 2px", fontSize: "0.87rem", color: "rgba(255,255,255,0.75)", lineHeight: 1.5 }}>
                    Open Telegram, search for{" "}
                    <strong style={{ color: "rgba(255,255,255,0.92)" }}>@BotFather</strong>{" "}
                    and open the conversation.
                  </p>
                  <TgMockupSearch />
                </div>
              </li>

              {/* Instruction 2 */}
              <li style={{ display: "flex", gap: 12, marginBottom: 18, alignItems: "flex-start" }}>
                <div style={{
                  width: 22,
                  height: 22,
                  borderRadius: "50%",
                  background: "rgba(139,92,246,0.8)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  color: "#fff",
                  flexShrink: 0,
                  marginTop: 1,
                }}>
                  2
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontSize: "0.87rem", color: "rgba(255,255,255,0.75)", lineHeight: 1.5 }}>
                    Type{" "}
                    <strong style={{ color: "rgba(255,255,255,0.92)", fontFamily: "monospace" }}>/newbot</strong>
                    , hit enter and give your bot a name, then hit enter again.
                  </p>
                </div>
              </li>

              {/* Instruction 3 */}
              <li style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <div style={{
                  width: 22,
                  height: 22,
                  borderRadius: "50%",
                  background: "rgba(139,92,246,0.8)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  color: "#fff",
                  flexShrink: 0,
                  marginTop: 1,
                }}>
                  3
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: "0 0 2px", fontSize: "0.87rem", color: "rgba(255,255,255,0.75)", lineHeight: 1.5 }}>
                    Copy and paste the token you receive:
                  </p>
                  <TgMockupToken />

                  <input
                    value={token}
                    onChange={(e) => {
                      setToken(e.target.value)
                      setTokenSaved(false)
                    }}
                    placeholder="7412938475:AAHdqTcvCH1vGWJxfSeofSs4tLuWQLZauE"
                    style={{
                      ...S.input,
                      fontFamily: "monospace",
                      fontSize: "0.78rem",
                      marginTop: 6,
                    }}
                  />
                  {tokenSaved ? (
                    <p style={{ ...S.hint, color: "rgba(16,185,129,0.85)", marginTop: 5 }}>
                      ✓ Token saved
                    </p>
                  ) : token.length > 0 ? (
                    <p style={{ ...S.hint, color: "rgba(255,255,255,0.38)", marginTop: 5 }}>
                      Paste your full token (min. 25 characters)
                    </p>
                  ) : null}
                </div>
              </li>
            </ol>

            <button
              onClick={() => setStep(3)}
              disabled={token.length < 25}
              style={{
                ...S.btn,
                opacity: token.length < 25 ? 0.4 : 1,
                cursor: token.length < 25 ? "not-allowed" : "pointer",
              }}
            >
              Next Step →
            </button>
          </div>

        ) : (
          /* ── Step 3: Say hello to your bot ── */
          <div>
            <h2 style={{
              fontSize: "1.05rem",
              fontWeight: 700,
              color: "rgba(255,255,255,0.95)",
              margin: "0 0 16px",
              textAlign: "center",
            }}>
              Final Step — Say Hello to your bot 👋
            </h2>

            <p style={{
              fontSize: "0.88rem",
              color: "rgba(255,255,255,0.75)",
              lineHeight: 1.55,
              margin: "0 0 4px",
            }}>
              Open a chat with your bot and send it any message — 'Hello', 'Hi', anything. This first message activates the bot. Then return here and press the button below.
            </p>

            {/* Warning box */}
            <div style={{
              background: "rgba(239,68,68,0.12)",
              border: "1px solid rgba(239,68,68,0.35)",
              borderRadius: 12,
              padding: "14px 16px",
              margin: "16px 0",
            }}>
              <p style={{ margin: "0 0 6px", fontSize: "0.85rem", color: "rgba(239,68,68,0.9)", fontWeight: 700 }}>
                ⚠️ Make sure to send a message to your bot before confirming.
              </p>
              <p style={{ margin: 0, fontSize: "0.82rem", color: "rgba(255,255,255,0.6)", lineHeight: 1.45 }}>
                If you skip this step <strong>THE BOT WILL NOT WORK</strong>.
              </p>
            </div>

            <button onClick={handleConfirm} style={{ ...S.btn, marginTop: 8 }}>
              Confirm chat started
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── SettingsPage ──────────────────────────────────────────────────────────────

export default function SettingsPage({ onDepartureAirportSaved, navigate }) {
  const { authFetch } = useAuth()

  const [departureAirport, setDepartureAirport] = useState("")
  const [cronExpr, setCronExpr]                 = useState("0 */6 * * *")
  const [scheduledHour, setScheduledHour]       = useState(9)
  const [botToken, setBotToken]                 = useState("")
  const [chatId, setChatId]                     = useState("")
  const [notifInapp, setNotifInapp]             = useState(false)
  const [notifTelegram, setNotifTelegram]       = useState(false)
  const [saving, setSaving]                     = useState(false)
  const [toast, setToast]                       = useState(null) // { type, text }
  const [showTgSetup, setShowTgSetup]           = useState(false)

  const tgConnected = !!(botToken && chatId)

  // Load settings on mount
  useEffect(() => {
    authFetch(`${API}/settings`)
      .then((r) => r.json())
      .then((d) => {
        setDepartureAirport(d.departure_airport || "")
        setCronExpr(d.cron_expr || "0 */6 * * *")
        if (SUB_DAILY.includes(d.cron_expr)) {
          setScheduledHour(utcToLocal(d.scheduled_hour ?? 9))
        }
        setBotToken(d.bot_token || "")
        setChatId(d.chat_id || "")
        setNotifInapp(!!d.notif_inapp)
        setNotifTelegram(!!d.notif_telegram)
      })
      .catch(() => {})
  }, [])

  // Dismiss toast
  useEffect(() => {
    if (!toast) return
    const id = setTimeout(() => setToast(null), 3200)
    return () => clearTimeout(id)
  }, [toast])

  async function handleSave() {
    setSaving(true)
    try {
      const body = {
        cron_expr:      cronExpr,
        scheduled_hour: SUB_DAILY.includes(cronExpr) ? localToUtc(scheduledHour) : null,
        bot_token:      botToken,
        chat_id:        chatId,
        notif_inapp:    notifInapp    ? 1 : 0,
        notif_telegram: notifTelegram ? 1 : 0,
      }
      const res = await authFetch(`${API}/settings`, {
        method:  "PUT",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(body),
      })
      if (res.ok) {
        setToast({ type: "ok", text: "Settings saved ✓" })
      } else {
        setToast({ type: "err", text: "Failed to save settings" })
      }
    } catch {
      setToast({ type: "err", text: "Failed to save settings" })
    } finally {
      setSaving(false)
    }
  }

  function handleTgComplete(newChatId) {
    setChatId(newChatId)
    setNotifTelegram(true)
    // Persist telegram on + new chat_id immediately
    authFetch(`${API}/settings`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: newChatId, notif_telegram: 1 }),
    }).catch(() => {})
    setShowTgSetup(false)
    setToast({ type: "ok", text: "✅ Telegram connected successfully!" })
  }

  function handleTgCancel() {
    authFetch(`${API}/settings`, {
      method:  "PUT",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ bot_token: "", chat_id: "" }),
    }).catch(() => {})
    setBotToken("")
    setChatId("")
    setShowTgSetup(false)
    if (navigate) navigate("deals")
  }

  const isSubDaily = SUB_DAILY.includes(cronExpr)

  return (
    <>
      {showTgSetup && (
        <TelegramSetupModal
          onClose={() => setShowTgSetup(false)}
          onCancel={handleTgCancel}
          onComplete={handleTgComplete}
          initialToken={botToken}
        />
      )}

      <div style={S.page}>
        {/* Page header */}
        <div>
          <h1 style={S.heading}>Settings</h1>
          <p style={S.subheading}>Configure your deal alerts and preferences</p>
        </div>

        {/* ── Card 1: Departure Airport ── */}
        <div style={S.card}>
          <p style={S.cardTitle}>Departure Airport</p>
          <DepartureAirportField
            value={departureAirport}
            authFetch={authFetch}
            onSaved={(iata) => {
              setDepartureAirport(iata)
              if (onDepartureAirportSaved) onDepartureAirportSaved(iata)
            }}
          />
        </div>

        {/* ── Card 2: Deal Frequency ── */}
        <div style={S.card}>
          <p style={S.cardTitle}>Deal Frequency</p>
          <p style={{ ...S.subtitle, marginTop: -6, marginBottom: 16 }}>
            How often should we scan for new flight deals?
          </p>

          <label style={S.label}>Check frequency</label>
          <select
            value={cronExpr}
            onChange={(e) => setCronExpr(e.target.value)}
            style={S.select}
          >
            {CRON_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>

          {isSubDaily && (
            <>
              <div style={S.divider} />
              <label style={S.label}>
                Preferred alert time{" "}
                <span style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.75rem" }}>
                  ({tzLabel()})
                </span>
              </label>
              <select
                value={scheduledHour}
                onChange={(e) => setScheduledHour(Number(e.target.value))}
                style={S.select}
              >
                {HOUR_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <p style={S.hint}>
                {cronExpr === "0 9,21 * * *"
                  ? `Alerts sent at ${HOUR_OPTIONS[scheduledHour]?.label} and 12 hours later`
                  : `Alerts sent at ${HOUR_OPTIONS[scheduledHour]?.label} daily`}
              </p>
            </>
          )}
        </div>

        {/* ── Card 3: Notifications ── */}
        <div style={S.card}>
          <p style={{ ...S.cardTitle, color: "#ffffff" }}>🔔 Notifications</p>

          {/* In-app notifications row */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <div>
              <p style={{ margin: 0, fontSize: "0.88rem", color: "#ffffff", fontWeight: 600 }}>In-app notifications</p>
              <p style={{ margin: "2px 0 0", fontSize: "0.75rem", color: "rgba(255,255,255,0.4)" }}>Show alerts in the notification bell</p>
            </div>
            <button
              onClick={() => setNotifInapp(v => !v)}
              style={S.toggle(notifInapp)}
              aria-label="Toggle in-app notifications"
            >
              <div style={S.toggleKnob(notifInapp)} />
            </button>
          </div>

          <div style={S.divider} />

          {/* Telegram row */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, marginTop: 16 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <p style={{ margin: 0, fontSize: "0.88rem", color: "#ffffff", fontWeight: 600 }}>Telegram</p>
                <span style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.4)" }}>(Beta)</span>
                {tgConnected && (
                  <span style={{
                    fontSize: "0.72rem", fontWeight: 700,
                    color: "rgba(16,185,129,0.9)",
                    background: "rgba(16,185,129,0.12)",
                    border: "1px solid rgba(16,185,129,0.3)",
                    borderRadius: 20, padding: "2px 8px",
                  }}>
                    ✓ Connected
                  </span>
                )}
              </div>
              <p style={{ margin: "2px 0 0", fontSize: "0.75rem", color: "rgba(255,255,255,0.4)" }}>
                {tgConnected ? "Send deal alerts to your Telegram bot" : "Not configured yet"}
              </p>
            </div>
            <button
              onClick={() => tgConnected && setNotifTelegram(v => !v)}
              disabled={!tgConnected}
              style={{
                ...S.toggle(notifTelegram && tgConnected),
                opacity: tgConnected ? 1 : 0.35,
                cursor: tgConnected ? "pointer" : "not-allowed",
              }}
              aria-label="Toggle Telegram notifications"
            >
              <div style={S.toggleKnob(notifTelegram && tgConnected)} />
            </button>
          </div>

          <button
            onClick={() => setShowTgSetup(true)}
            style={{
              ...S.btn,
              background: tgConnected ? "rgba(255,255,255,0.08)" : "rgba(139,92,246,0.8)",
              border: tgConnected ? "1px solid rgba(255,255,255,0.18)" : "none",
              color: tgConnected ? "rgba(255,255,255,0.75)" : "#fff",
            }}
          >
            {tgConnected ? "Reset Telegram bot" : "Help me set up Telegram Alerts"}
          </button>
        </div>

        {/* Save button */}
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            ...S.btn,
            opacity: saving ? 0.6 : 1,
            cursor: saving ? "not-allowed" : "pointer",
          }}
        >
          {saving ? "Saving…" : "Save Settings"}
        </button>
      </div>

      {/* Toast */}
      {toast && (
        <div style={S.toast(toast.type)}>{toast.text}</div>
      )}
    </>
  )
}
