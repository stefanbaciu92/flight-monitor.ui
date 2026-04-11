export default function DealCard({ deal }) {
  const d = new Date(deal.sent_at)
  const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  const timeStr = `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')} · ${days[d.getDay()]} ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`

  const departure = deal.departure === 'flexible (check site)' || deal.departure === 'see deal page'
    ? 'Flexible — check site'
    : deal.departure || '—'

  return (
    <div className="deal-card">
      {/* Header */}
      <div className="deal-card-header">
        <span className="deal-flag">{deal.flag || '✈️'}</span>
        <div>
          <div className="deal-dest">{deal.destination}</div>
          <div className="deal-time">{timeStr}</div>
        </div>
        {deal.discount_pct && (
          <span className="deal-badge">-{deal.discount_pct}%</span>
        )}
      </div>

      {/* Price */}
      {deal.price && (
        <div className="deal-price">
          €{Math.round(deal.price)}
          <span className="deal-price-sub"> one-way</span>
        </div>
      )}

      {/* Info rows */}
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
          <span className="deal-info-value">OTP → {deal.iata || '—'}</span>
        </div>
      </div>

      {/* CTA */}
      {deal.url && (
        <a className="deal-cta" href={deal.url} target="_blank" rel="noreferrer">
          View deal →
        </a>
      )}
    </div>
  )
}
