import { useEffect, useState, useRef } from 'react'

const MESSAGES = [
  'Loading',
  'Calculating velocity',
  'Purpling',
  'Checking parameters',
  'Watering Flowers',
  'Discombobulating',
  'Interpreting',
]

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const CSS = `
  @keyframes pldr-spin {
    from { transform: translateX(0); }
    to   { transform: translateX(100px); }
  }
  @keyframes pldr-orbit {
    0%    { transform: translate(140px,50px)  rotate(90deg)  scale(.43); opacity:1; }
    12.5% { transform: translate(114px,70px)  rotate(163deg) scale(.43); opacity:1; }
    25%   { transform: translate(50px, 78px)  rotate(180deg) scale(.43); opacity:1; }
    37.5% { transform: translate(-14px,70px)  rotate(197deg) scale(.43); opacity:1; }
    50%   { transform: translate(-40px,50px)  rotate(270deg) scale(.43); opacity:1; }
    62.5% { transform: translate(-14px,30px)  rotate(343deg) scale(.43); opacity:0; }
    75%   { transform: translate(50px, 22px)  rotate(360deg) scale(.43); opacity:0; }
    87.5% { transform: translate(114px,30px)  rotate(377deg) scale(.43); opacity:0; }
    100%  { transform: translate(140px,50px)  rotate(450deg) scale(.43); opacity:1; }
  }
  .pldr-surface { animation: pldr-spin  7.5s linear infinite; }
  .pldr-plane   { animation: pldr-orbit 1.5s linear infinite; }
  @keyframes pldr-msg-in {
    from { opacity:0; transform:translateY(5px); }
    to   { opacity:1; transform:translateY(0);   }
  }
`

// Each message runs for 8 ticks (2 full 0-1-2-3 dot cycles) at 1.2 s/tick = 9.6 s per message.
const DOT_INTERVAL = 1200
const TICKS_PER_MSG = 8  // 2 × 4-step dot cycle

export default function PlanetLoader() {
  const queueRef             = useRef(shuffle(MESSAGES))
  const [msgIdx, setMsgIdx]  = useState(0)
  const [dots, setDots]      = useState(0)

  useEffect(() => {
    let idx  = 0
    let tick = 0   // 0..7 within the current message

    const id = setInterval(() => {
      tick++
      if (tick >= TICKS_PER_MSG) {
        // Advance to next message
        tick = 0
        idx  = (idx + 1) % queueRef.current.length
        if (idx === 0) queueRef.current = shuffle(MESSAGES)
        setMsgIdx(idx)
        setDots(0)
      } else {
        setDots(tick % 4)
      }
    }, DOT_INTERVAL)

    return () => clearInterval(id)
  }, [])

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      gap: '24px',
      background: 'rgba(12, 0, 28, 0.62)',
      backdropFilter: 'blur(6px)',
      WebkitBackdropFilter: 'blur(6px)',
    }}>
      <style>{CSS}</style>

      <svg
        width="280" height="160"
        viewBox="-90 -30 280 160"
        overflow="visible"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <clipPath id="pldr-clip">
            <circle cx="50" cy="50" r="50"/>
          </clipPath>

          <radialGradient id="pldr-ocean" cx="36%" cy="30%" r="68%" gradientUnits="objectBoundingBox">
            <stop offset="0%"   stopColor="#5b21b6"/>
            <stop offset="55%"  stopColor="#3b0764"/>
            <stop offset="100%" stopColor="#140026"/>
          </radialGradient>

          <radialGradient id="pldr-gloss" cx="32%" cy="27%" r="40%" gradientUnits="objectBoundingBox">
            <stop offset="0%"   stopColor="#ffffff" stopOpacity={0.18}/>
            <stop offset="100%" stopColor="#ffffff" stopOpacity={0}/>
          </radialGradient>

          <radialGradient id="pldr-atmos" cx="50%" cy="50%" r="50%" gradientUnits="objectBoundingBox">
            <stop offset="76%"  stopColor="#7c3aed" stopOpacity={0}/>
            <stop offset="100%" stopColor="#c084fc" stopOpacity={0.6}/>
          </radialGradient>

          <g id="pldr-land">
            {/* Greenland */}
            <path fill="#a78bfa" d="M 28,0 C 36,-4 46,2 46,12 C 46,22 38,26 28,22 C 18,18 18,6 28,0 Z"/>
            {/* North America */}
            <path fill="#7c3aed" d="M 12,12 C 20,4 36,6 42,16 C 48,26 44,38 40,48 C 38,54 32,56 26,50 C 20,44 16,42 10,44 C 4,46 2,36 4,26 C 6,16 6,20 12,12 Z"/>
            {/* Alaska */}
            <path fill="#8b5cf6" d="M 4,26 C 2,20 -2,16 -2,22 C -2,28 2,32 6,30 Z"/>
            {/* Central America isthmus */}
            <path fill="#6d28d9" d="M 26,50 C 28,54 28,58 24,60 C 22,62 20,60 20,56 C 20,52 22,50 26,50 Z"/>
            {/* South America */}
            <path fill="#7c3aed" d="M 20,58 C 26,52 32,56 34,66 C 36,76 32,86 26,90 C 20,94 12,90 10,82 C 8,74 10,66 16,60 C 18,56 18,60 20,58 Z"/>
            {/* Europe */}
            <path fill="#7c3aed" d="M 52,8 C 58,2 70,6 72,16 C 74,24 70,30 62,32 C 56,34 48,28 48,20 C 48,12 46,12 52,8 Z"/>
            {/* Scandinavia */}
            <path fill="#8b5cf6" d="M 56,4 C 60,-2 68,0 68,10 C 66,16 60,16 56,12 Z"/>
            {/* Mediterranean notch */}
            <path fill="#3b0764" d="M 54,30 C 58,26 64,28 66,34 C 64,38 58,38 54,34 Z"/>
            {/* Africa */}
            <path fill="#7c3aed" d="M 48,28 C 58,20 72,26 78,40 C 84,54 80,68 74,78 C 68,88 58,94 48,90 C 38,86 32,74 34,62 C 36,50 38,36 48,28 Z"/>
            {/* West Africa bulge */}
            <path fill="#6d28d9" d="M 48,52 C 42,46 34,50 36,58 C 38,66 46,66 50,60 Z"/>
            {/* Arabian Peninsula */}
            <path fill="#7c3aed" d="M 78,40 C 86,34 92,42 90,52 C 88,60 80,60 78,52 Z"/>
            {/* Indian subcontinent */}
            <path fill="#7c3aed" d="M 78,54 C 84,50 90,58 86,68 C 82,76 74,74 72,66 C 70,58 74,56 78,54 Z"/>
            {/* Asia */}
            <path fill="#7c3aed" d="M 68,4 C 80,-2 98,4 100,18 C 102,32 94,42 84,42 C 74,42 68,30 68,18 Z"/>
            {/* Siberia */}
            <path fill="#8b5cf6" d="M 82,2 C 92,-4 102,2 100,12 C 98,18 88,18 82,12 Z"/>
            {/* SE Asia */}
            <path fill="#8b5cf6" d="M 84,52 C 90,48 96,54 94,60 C 92,64 84,64 82,60 Z"/>
            <path fill="#7c3aed" d="M 90,62 C 94,60 98,64 96,70 C 94,72 90,72 90,68 Z"/>
            {/* Australia */}
            <path fill="#8b5cf6" d="M 78,62 C 86,56 96,60 96,70 C 96,80 90,88 80,88 C 70,88 64,80 66,72 C 68,62 70,68 78,62 Z"/>
            {/* Cape York */}
            <path fill="#7c3aed" d="M 94,62 C 98,58 102,62 100,68 C 98,72 94,70 94,66 Z"/>
            {/* Antarctica */}
            <path fill="#a78bfa" opacity="0.75" d="M 0,92 C 20,86 42,84 60,86 C 76,88 92,92 106,96 L 106,110 L -6,110 Z"/>
          </g>
        </defs>

        {/* Ocean */}
        <circle cx="50" cy="50" r="50" fill="url(#pldr-ocean)"/>

        {/* Continents — two tiles for seamless L→R scroll */}
        <g clipPath="url(#pldr-clip)">
          <g className="pldr-surface">
            <use href="#pldr-land"/>
            <use href="#pldr-land" transform="translate(-100,0)"/>
          </g>
        </g>

        {/* Specular gloss */}
        <circle cx="50" cy="50" r="50" fill="url(#pldr-gloss)"/>

        {/* Atmosphere limb */}
        <circle cx="50" cy="50" r="50" fill="url(#pldr-atmos)"/>

        {/* Plane — CW equatorial orbit */}
        <g className="pldr-plane">
          <path d="M 55,0 C 52,-7 42,-10 25,-10 L -50,-6 C -57,-3 -60,0 -60,0 C -57,3 -50,6 25,10 C 42,10 52,7 55,0 Z" fill="#facc15"/>
          <path d="M 15,10 C 0,18 -18,36 -48,62 L -53,58 C -24,32 -2,14 11,12 Z" fill="#facc15"/>
          <path d="M -4,36 C -4,31 -14,29 -24,31 C -32,34 -32,40 -24,43 C -14,45 -4,43 -4,38 Z" fill="#facc15"/>
          <path d="M -50,-6 C -52,-14 -54,-28 -55,-40 C -56,-46 -60,-45 -59,-39 C -58,-30 -57,-18 -56,-8 Z" fill="#facc15"/>
          <path d="M -54,6 C -56,13 -59,24 -65,34 C -67,38 -65,41 -62,38 C -57,29 -55,18 -54,9 Z" fill="#facc15"/>
        </g>
      </svg>

      {/* Message — key remounts (restarts fade-in) only when the text changes */}
      <p
        key={msgIdx}
        style={{
          margin: 0,
          color: 'rgba(255,255,255,0.9)',
          fontSize: '0.92rem',
          fontWeight: 600,
          letterSpacing: '0.5px',
          minWidth: '220px',
          textAlign: 'center',
          animation: 'pldr-msg-in 0.35s ease forwards',
        }}
      >
        {queueRef.current[msgIdx]}
        <span style={{ display: 'inline-block', width: '1.6em', textAlign: 'left' }}>
          {'.'.repeat(dots)}
        </span>
      </p>
    </div>
  )
}
