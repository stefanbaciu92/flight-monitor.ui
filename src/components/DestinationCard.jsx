export default function DestinationCard({ name, info, onDelete }) {
  return (
    <div className="dest-card">
      <div className="dest-card-top">
        <div className="dest-flag">{info.flag || '✈️'}</div>
        <div className="dest-name">{name}</div>
        {info.airports?.length > 0 && (
          <div className="dest-airports">🛬 {info.airports.join(', ')}</div>
        )}
        <div className="dest-baseline">Baseline: €{info.baseline}</div>
        {info.zbordirect_slug && (
          <div className="dest-airports" style={{marginTop: 4}}>🔗 zbordirect tracked</div>
        )}
      </div>
      <button className="dest-delete-btn" onClick={onDelete} title={`Remove ${name}`}>✕</button>
    </div>
  )
}
