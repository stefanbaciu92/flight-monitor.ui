import { useEffect, useState } from "react"
import { useAuth } from "../context/AuthContext"

const API = "https://linariaskc.com"

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

function XIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.261 5.632 5.903-5.632zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  )
}

function DiscordIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="#fff">
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.043.033.057a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
    </svg>
  )
}

const PLANE = [
  "M 55,0 C 52,-7 42,-10 25,-10 L -50,-6 C -57,-3 -60,0 -60,0 C -57,3 -50,6 25,10 C 42,10 52,7 55,0 Z",
  "M 15,10 C 0,18 -18,36 -48,62 L -53,58 C -24,32 -2,14 11,12 Z",
  "M -4,36 C -4,31 -14,29 -24,31 C -32,34 -32,40 -24,43 C -14,45 -4,43 -4,38 Z",
  "M -50,-6 C -52,-14 -54,-28 -55,-40 C -56,-46 -60,-45 -59,-39 C -58,-30 -57,-18 -56,-8 Z",
  "M -54,6 C -56,13 -59,24 -65,34 C -67,38 -65,41 -62,38 C -57,29 -55,18 -54,9 Z",
]

// Big orbit for the left-panel / mobile-top logo
const ANIM_CSS = `
  @keyframes planefly {
    0%   { transform: translate(288px,38px) rotate(-18deg)  scale(.52); animation-timing-function: linear; }
    1%   { transform: translate(285px,35px) rotate(-22deg)  scale(.52); animation-timing-function: linear; }
    2%   { transform: translate(292px,41px) rotate(-14deg)  scale(.52); animation-timing-function: linear; }
    3%   { transform: translate(284px,39px) rotate(-22deg)  scale(.52); animation-timing-function: linear; }
    4%   { transform: translate(293px,37px) rotate(-13deg)  scale(.52); animation-timing-function: linear; }
    5%   { transform: translate(285px,38px) rotate(-22deg)  scale(.52); animation-timing-function: linear; }
    6%   { transform: translate(291px,38px) rotate(-45deg)  scale(.52); animation-timing-function: linear; }
    7%   { transform: translate(288px,35px) rotate(-75deg)  scale(.52); animation-timing-function: linear; }

    /* ORBIT — continuous angles so CSS never spins the wrong way */
    8%   { transform: translate(288px, 40px) rotate(-90deg)  scale(.52); animation-timing-function: linear; }
    14%  { transform: translate(243px,-24px) rotate(-150deg) scale(.52); animation-timing-function: linear; }
    20%  { transform: translate(133px,-50px) rotate(-180deg) scale(.52); animation-timing-function: linear; }
    25%  { transform: translate(23px, -24px) rotate(-210deg) scale(.52); animation-timing-function: linear; }
    31%  { transform: translate(-22px, 40px) rotate(-270deg) scale(.52); animation-timing-function: linear; }
    37%  { transform: translate(23px, 104px) rotate(-330deg) scale(.52); animation-timing-function: linear; }
    42%  { transform: translate(133px,130px) rotate(-360deg) scale(.52); animation-timing-function: linear; }
    48%  { transform: translate(243px,104px) rotate(-390deg) scale(.52); animation-timing-function: ease-out; }

    /* LANDING — arrive directly at home, no intermediate snap */
    55%  { transform: translate(288px, 38px) rotate(-378deg) scale(.52); animation-timing-function: linear; }
    100% { transform: translate(288px, 38px) rotate(-378deg) scale(.52); }
  }
  .plane-anim { animation: planefly 11s infinite; }
`

// Tight orbit that skims very close to the "Linaria" letters.
// Ellipse: a=160, b=42, center=(145,36) — text cap-top ≈ y=10, baseline ≈ y=62.
// 8 CCW waypoints (θ=0..315 at 45° steps), continuous angles -90 → -450.
const CLOSE_ORBIT_CSS = `
  @keyframes plane-close {
    0%    { transform: translate(305px, 36px) rotate(-90deg)  scale(.38); }
    12.5% { transform: translate(258px,  6px) rotate(-135deg) scale(.38); }
    25%   { transform: translate(145px, -6px) rotate(-180deg) scale(.38); }
    37.5% { transform: translate( 32px,  6px) rotate(-225deg) scale(.38); }
    50%   { transform: translate(-15px, 36px) rotate(-270deg) scale(.38); }
    62.5% { transform: translate( 32px, 66px) rotate(-315deg) scale(.38); }
    75%   { transform: translate(145px, 78px) rotate(-360deg) scale(.38); }
    87.5% { transform: translate(258px, 66px) rotate(-405deg) scale(.38); }
    100%  { transform: translate(305px, 36px) rotate(-450deg) scale(.38); }
  }
  .plane-close { animation: plane-close 3s linear infinite; }
`

function LogoSVG() {
  return (
    <svg
      width="330" height="114"
      viewBox="0 0 330 114"
      overflow="visible"
      xmlns="http://www.w3.org/2000/svg"
    >
      <style>{ANIM_CSS}</style>

      <text x="0" y="62"
        fontFamily="Figtree, sans-serif"
        fontSize="72" fontWeight="800"
        fill="#6a0dad">Linaria</text>

      <g className="plane-anim">
        {PLANE.map((d, i) => <path key={i} d={d} fill="#facc15" />)}
      </g>

      <text x="2" y="96"
        fontFamily="Figtree, sans-serif"
        fontSize="18" fontWeight="400"
        fill="#7c3aed" letterSpacing="0.5">Never miss a deal</text>
    </svg>
  )
}

// Compact logo for the login card — plane orbits tight around the text.
// Rendered at natural SVG size then scaled via CSS transform on the wrapper.
const SCALE = 0.55
const SVG_W = 330
const SVG_H = 114
// Plane goes 6px above SVG top; at SCALE that's ~4px — add 6px top room.
const TOP_PAD = 6

function InlineLogo() {
  return (
    <div style={{
      position: 'relative',
      width: Math.round(SVG_W * SCALE) + 'px',
      height: Math.round((SVG_H + TOP_PAD) * SCALE) + 'px',
      margin: '0 auto 16px',
    }}>
      <div style={{
        position: 'absolute',
        top: Math.round(TOP_PAD * SCALE) + 'px',
        left: 0,
        transformOrigin: 'top left',
        transform: `scale(${SCALE})`,
      }}>
        <svg
          width={SVG_W} height={SVG_H}
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          xmlns="http://www.w3.org/2000/svg"
        >
          <text x="0" y="62"
            fontFamily="Figtree, sans-serif"
            fontSize="72" fontWeight="800"
            fill="#6a0dad">Linaria</text>
        </svg>
      </div>
    </div>
  )
}

function LoginCard({ onLogin, onDiscordLogin, onXLogin }) {
  return (
    <div style={{ width: "100%", maxWidth: "360px", textAlign: "center" }}>
      <h1 style={{
        fontFamily: "Georgia, 'Times New Roman', serif",
        fontSize: "2.4rem",
        fontWeight: "normal",
        color: "#2e1065",
        margin: "0 0 6px",
        lineHeight: 1.2,
        letterSpacing: "-0.3px",
      }}>
        Welcome to
      </h1>

      <InlineLogo />

      <p style={{
        fontFamily: "Georgia, 'Times New Roman', serif",
        fontSize: "1.05rem",
        color: "#6d28d9",
        margin: "0 0 48px",
        lineHeight: 1.5,
      }}>
        Best flight deals in the world.
      </p>

      <p style={{
        fontSize: "0.88rem",
        color: "#9ca3af",
        margin: "0 0 20px",
        letterSpacing: "0.1px",
      }}>
        Login to start getting deals.
      </p>

      <button
        onClick={onLogin}
        onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 4px 20px rgba(109,40,217,0.2)" }}
        onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 2px 10px rgba(0,0,0,0.08)" }}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "12px",
          padding: "14px 20px",
          borderRadius: "12px",
          border: "1px solid #e5e7eb",
          background: "#fff",
          color: "#1f1f1f",
          fontSize: "0.95rem",
          fontWeight: 600,
          cursor: "pointer",
          boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
          transition: "box-shadow 0.2s",
        }}
      >
        <GoogleIcon /> Continue with Google
      </button>

      <button
        onClick={onDiscordLogin}
        onMouseEnter={e => { e.currentTarget.style.opacity = "0.9" }}
        onMouseLeave={e => { e.currentTarget.style.opacity = "1" }}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "12px",
          padding: "14px 20px",
          marginTop: "12px",
          borderRadius: "12px",
          border: "none",
          background: "#5865F2",
          color: "#fff",
          fontSize: "0.95rem",
          fontWeight: 600,
          cursor: "pointer",
          boxShadow: "0 2px 10px rgba(88,101,242,0.35)",
          transition: "opacity 0.2s",
        }}
      >
        <DiscordIcon /> Continue with Discord
      </button>

      <button
        onClick={onXLogin}
        onMouseEnter={e => { e.currentTarget.style.opacity = "0.85" }}
        onMouseLeave={e => { e.currentTarget.style.opacity = "1" }}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "12px",
          padding: "14px 20px",
          marginTop: "12px",
          borderRadius: "12px",
          border: "none",
          background: "#000",
          color: "#fff",
          fontSize: "0.95rem",
          fontWeight: 600,
          cursor: "pointer",
          boxShadow: "0 2px 10px rgba(0,0,0,0.25)",
          transition: "opacity 0.2s",
        }}
      >
        <XIcon /> Continue with X
      </button>
    </div>
  )
}

export default function LandingPage() {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768)

  useEffect(() => {
    const link = document.createElement('link')
    link.href = 'https://fonts.googleapis.com/css2?family=Figtree:wght@400;800&display=swap'
    link.rel = 'stylesheet'
    document.head.appendChild(link)
    return () => { try { document.head.removeChild(link) } catch(e) {} }
  }, [])

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)')
    const handler = e => setIsMobile(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  const handleLogin = () => { window.location.href = `${API}/auth/google/login` }
  const handleDiscordLogin = () => { window.location.href = `${API}/auth/discord/login` }
  const handleXLogin = () => { window.location.href = `${API}/auth/x/login` }

  if (isMobile) {
    return (
      <div style={{
        position: "fixed", inset: 0,
        backgroundImage: "url('/sky.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        padding: "68px 24px 40px",
        overflowY: "auto",
      }}>
        {/* Logo + animation */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "40px",
          width: "100%",
          paddingTop: "44px",
          paddingBottom: "16px",
        }}>
          <div style={{ transform: "scale(0.78)", transformOrigin: "center top" }}>
            <LogoSVG />
          </div>
        </div>

        {/* Frosted glass login card */}
        <div style={{
          width: "100%",
          maxWidth: "360px",
          background: "rgba(255,255,255,0.88)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          borderRadius: "20px",
          padding: "36px 28px",
          boxShadow: "0 8px 32px rgba(46,16,101,0.18)",
        }}>
          <LoginCard onLogin={handleLogin} onDiscordLogin={handleDiscordLogin} onXLogin={handleXLogin} />
        </div>
      </div>
    )
  }

  return (
    <div style={{ position: "fixed", inset: 0, display: "flex" }}>

      {/* Left: sky photo + animated logo */}
      <div style={{
        flex: 1,
        backgroundImage: "url('/sky.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>
        <LogoSVG />
      </div>

      {/* Right: login panel */}
      <div style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#fff",
        padding: "48px 40px",
      }}>
        <LoginCard onLogin={handleLogin} onDiscordLogin={handleDiscordLogin} onXLogin={handleXLogin} />
      </div>
    </div>
  )
}
