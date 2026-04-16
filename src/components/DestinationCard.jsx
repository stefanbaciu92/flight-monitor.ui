const IMG_BASE = 'https://linariaskc.com'

export default function DestinationCard({ name, info, onDelete }) {
  const imgSrc = IMG_BASE + (info.image || '/dest-images/default.jpg')

  return (
    <div className="dest-card" style={{ minHeight: '200px', padding: 0, overflow: 'hidden' }}>
      <div style={{ width: '100%', height: '110px', flexShrink: 0, overflow: 'hidden', borderRadius: '16px 16px 0 0' }}>
        <img
          src={imgSrc}
          alt={name}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={e => { e.target.src = IMG_BASE + '/dest-images/default.jpg' }}
        />
      </div>
      <div style={{ padding: '12px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flex: 1 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span className="dest-flag" style={{ fontSize: '1.4rem' }}>{info.flag || '✈️'}</span>
            <span className="dest-name">{name}</span>
          </div>
          {info.airports?.length > 0 && (
            <div className="dest-airports">🛬 {info.airports.join(', ')}</div>
          )}
          <div className="dest-baseline">Baseline: €{info.baseline}</div>
        </div>
        <button className="dest-delete-btn" onClick={onDelete} title={`Remove ${name}`}>✕</button>
      </div>
    </div>
  )
}
