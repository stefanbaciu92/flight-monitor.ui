import { useEffect } from "react"
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

const PLANE = [
  "M 55,0 C 52,-7 42,-10 25,-10 L -50,-6 C -57,-3 -60,0 -60,0 C -57,3 -50,6 25,10 C 42,10 52,7 55,0 Z",
  "M 15,10 C 0,18 -18,36 -48,62 L -53,58 C -24,32 -2,14 11,12 Z",
  "M -4,36 C -4,31 -14,29 -24,31 C -32,34 -32,40 -24,43 C -14,45 -4,43 -4,38 Z",
  "M -50,-6 C -52,-14 -54,-28 -55,-40 C -56,-46 -60,-45 -59,-39 C -58,-30 -57,-18 -56,-8 Z",
  "M -54,6 C -56,13 -59,24 -65,34 C -67,38 -65,41 -62,38 C -57,29 -55,18 -54,9 Z",
]

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

export default function LandingPage() {
  useEffect(() => {
    const link = document.createElement('link')
    link.href = 'https://fonts.googleapis.com/css2?family=Figtree:wght@400;800&display=swap'
    link.rel = 'stylesheet'
    document.head.appendChild(link)
    return () => { try { document.head.removeChild(link) } catch(e) {} }
  }, [])

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
        <div style={{ width: "100%", maxWidth: "360px", textAlign: "center" }}>

          <h1 style={{
            fontFamily: "Georgia, 'Times New Roman', serif",
            fontSize: "2.4rem",
            fontWeight: "normal",
            color: "#2e1065",
            margin: "0 0 12px",
            lineHeight: 1.2,
            letterSpacing: "-0.3px",
          }}>
            Welcome to Linaria
          </h1>

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
            onClick={() => { window.location.href = `${API}/auth/google/login` }}
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

        </div>
      </div>
    </div>
  )
}
