import { useEffect, useState, useMemo, useRef } from 'react'
import DealCard from '../components/DealCard'
import { useAuth } from '../context/AuthContext'
import PlanetLoader from '../components/PlanetLoader'

const API       = 'https://linariaskc.com'
const CACHE_KEY = 'flight-deals-cache'
const MIN_MS    = 5000

function formatLastAlert(deals) {
  if (!deals.length) return null
  const latest = deals[0]
  const d = new Date(latest.sent_at)
  const days   = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  const hh = String(d.getHours()).padStart(2,'0')
  const mm = String(d.getMinutes()).padStart(2,'0')
  return `posted at ${hh}:${mm} ${days[d.getDay()]} ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`
}

function readCache() {
  try { return JSON.parse(localStorage.getItem(CACHE_KEY) || '[]') }
  catch { return [] }
}

export default function DealsPage({ airportVersion = 0 }) {
  const { authFetch } = useAuth()
  const cached                      = useMemo(readCache, [])
  const [deals, setDeals]           = useState(cached)
  const [loading, setLoading]       = useState(true)
  const [running, setRunning]       = useState(false)
  const [triggerMsg, setTriggerMsg] = useState(null)
  const [destImages, setDestImages]   = useState({})
  const isFirstRender = useRef(true)

  // Clear deals when departure airport changes
  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return }
    setDeals([])
    localStorage.removeItem(CACHE_KEY)
    setTriggerMsg(null)
  }, [airportVersion])

  useEffect(() => {
    Promise.all([
      authFetch(`${API}/deals`).then(r => r.json()),
      authFetch(`${API}/destinations`).then(r => r.json()),
    ]).then(([dealsData, destData]) => {
      const fresh = dealsData.deals || []
      if (fresh.length > 0) {
        setDeals(fresh)
        localStorage.setItem(CACHE_KEY, JSON.stringify(fresh))
      }
      const imgs = {}
      Object.entries(destData.destinations || {}).forEach(([name, info]) => {
        if (info.image) imgs[name] = info.image
      })
      setDestImages(imgs)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  async function searchNow() {
    setRunning(true)
    setTriggerMsg(null)
    const triggeredAt = Date.now()
    try {
      const minWait = new Promise(r => setTimeout(r, MIN_MS))
      const trigger = authFetch(`${API}/trigger`, { method: 'POST' }).then(r => { if (!r.ok) throw new Error() })
      await Promise.all([trigger, minWait])

      const POLL_INTERVAL = 10000
      const MAX_POLLS     = 10
      let found = false

      for (let i = 0; i < MAX_POLLS; i++) {
        const fresh = await authFetch(`${API}/deals`).then(r => r.json()).then(d => d.deals || [])
        const latestSentAt = fresh[0] ? new Date(fresh[0].sent_at).getTime() : 0
        if (latestSentAt > triggeredAt) {
          setDeals(fresh)
          localStorage.setItem(CACHE_KEY, JSON.stringify(fresh))
          const n = fresh.length
          setTriggerMsg({ type: 'ok', text: `${n} deal${n !== 1 ? 's' : ''} found based on your destination choices` })
          found = true
          break
        }
        if (i < MAX_POLLS - 1) {
          await new Promise(r => setTimeout(r, POLL_INTERVAL))
        }
      }

      if (!found) {
        setTriggerMsg({
          type: 'ok',
          text: deals.length > 0
            ? 'No new deals found — your existing deals are up to date'
            : 'Search complete — no deals found for your destinations right now',
        })
      }
    } catch {
      setTriggerMsg({ type: 'err', text: 'Failed to trigger search' })
    } finally {
      setRunning(false)
    }
  }

  const lastAlert = formatLastAlert(deals)

  return (
    <div className="page">
      <div className="page-header">
        <h2>Your recent flight deals</h2>
        {lastAlert && <p className="subtitle">{lastAlert}</p>}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', marginBottom: '28px' }}>
        <button
          onClick={searchNow}
          disabled={running}
          style={{
            background: running ? 'rgba(139,92,246,0.3)' : 'rgba(139,92,246,0.55)',
            border: '1px solid rgba(139,92,246,0.7)',
            color: 'white', padding: '10px 28px', borderRadius: '50px',
            cursor: running ? 'not-allowed' : 'pointer', fontSize: '0.9rem',
            fontWeight: 600, transition: 'background 0.2s',
          }}
        >
          {running ? '🔍 Searching...' : '🔍 Search Deals Now'}
        </button>
        {triggerMsg && (
          <p style={{
            fontSize: '0.78rem', fontWeight: 500,
            color: triggerMsg.type === 'ok' ? '#86efac' : '#fca5a5',
          }}>
            {triggerMsg.text}
          </p>
        )}
      </div>

      {loading && deals.length === 0 && <p className="loading">Loading deals...</p>}

      {!loading && deals.length === 0 && !running && (
        <p className="no-data">No alerts triggered yet</p>
      )}

      {deals.length > 0 && (
        <div style={{ position: 'relative' }}>
          <div style={{ filter: running ? 'blur(3px)' : 'none', transition: 'filter 0.3s ease', pointerEvents: running ? 'none' : 'auto' }}>
            <div className="two-col-grid">
              {deals.map(deal => (
                <DealCard key={deal.source_key || deal.destination} deal={deal} imageUrl={destImages[deal.destination]} />
              ))}
            </div>
          </div>
          {running && <PlanetLoader />}
        </div>
      )}

      {deals.length === 0 && running && <PlanetLoader />}
    </div>
  )
}
