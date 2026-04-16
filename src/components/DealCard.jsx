const IMG_BASE = 'https://linariaskc.com'

export default function DealCard({ deal, imageUrl }) {
  const d = new Date(deal.sent_at)
  const days   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  const timeStr = `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')} · ${days[d.getDay()]} ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`

  const departure = deal.departure === 'flexible (check site)' || deal.departure === 'see deal page'
    ? 'Flexible — check site'
    : deal.departure || '—'

  const imgSrc = IMG_BASE + (imageUrl || '/dest-images/default.jpg')

  return (
    <div className="deal-card" style={{ padding: 0, overflow: 'hidden' }}>

      {/* Image banner */}
      <div style={{ position: 'relative', width: '100%', height: '120px', flexShrink: 0, overflow: 'hidden', borderRadius: '18px 18px 0 0' }}>
        <img
          src={imgSrc}
          alt={deal.destination}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={e => { e.target.src = IMG_BASE + '/dest-images/default.jpg' }}
        />
        {/* Overlay gradient so text is readable */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 60%)' }} />
        {/* Flag + destination name on image */}
        <div style={{ position: 'absolute', bottom: 10, left: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: '1.6rem', lineHeight: 1 }}>{deal.flag || '✈️'}</span>
          <div>
            <div className="deal-dest" style={{ textShadow: '0 1px 6px rgba(0,0,0,0.6)' }}>{deal.destination}</div>
            <div className="deal-time">{timeStr}</div>
          </div>
        </div>
        {deal.discount_pct && (
          <span className="deal-badge" style={{ position: 'absolute', top: 10, right: 10 }}>
            -{deal.discount_pct}%
          </span>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
        {deal.price && (
          <div className="deal-price">
            €{Math.round(deal.price)}
            <span className="deal-price-sub"> one-way</span>
          </div>
        )}

        <div className="deal-info-grid">
          <div className="deal-info-row">
            <span className="deal-info-label">📅 Departure</span>
            <span className="deal-info-value">{departure}</span>
          </div>
          <div className="deal-info-row">
            <span className="deal-info-label">✈️ Airline</span>
            <span className="deal-info-value">{deal.airline || '—'}</span>
          </div>
          <div className="deal-info-row">
            <span className="deal-info-label">🛫 Route</span>
            <span className="deal-info-value">{deal.origin || 'OTP'} → {deal.iata || '—'}</span>
          </div>
        </div>

        {deal.url && (
          <a className="deal-cta" href={deal.url} target="_blank" rel="noreferrer">
            View deal →
          </a>
        )}
      </div>
    </div>
  )
}
