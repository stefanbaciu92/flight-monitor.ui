import { useEffect, useState } from 'react'
import DealCard from '../components/DealCard'

const API = 'http://178.104.173.131:7070'

function formatLastAlert(deals) {
  if (!deals.length) return null
  const latest = deals[0]
  const d = new Date(latest.sent_at)
  const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  const hh = String(d.getHours()).padStart(2,'0')
  const mm = String(d.getMinutes()).padStart(2,'0')
  return `posted at ${hh}:${mm} ${days[d.getDay()]} ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`
}

export default function DealsPage() {
  const [deals, setDeals] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${API}/deals`)
      .then(r => r.json())
      .then(d => { setDeals(d.deals || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const lastAlert = formatLastAlert(deals)

  return (
    <div className="page">
      <div className="page-header">
        <h2>Your recent flight deals</h2>
        {lastAlert && <p className="subtitle">{lastAlert}</p>}
      </div>

      {loading && <p className="loading">Loading deals...</p>}

      {!loading && deals.length === 0 && (
        <p className="no-data">No alerts triggered yet</p>
      )}

      {!loading && deals.length > 0 && (
        <div className="two-col-grid">
          {deals.map(deal => (
            <DealCard key={deal.destination} deal={deal} />
          ))}
        </div>
      )}
    </div>
  )
}
