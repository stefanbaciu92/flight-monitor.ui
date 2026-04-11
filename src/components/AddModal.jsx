import { useState } from 'react'

export default function AddModal({ onClose, onSubmit }) {
  const [name, setName] = useState('')
  const [airports, setAirports] = useState('')
  const [baseline, setBaseline] = useState('200')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!name.trim()) { setError('Destination name is required'); return }
    if (!airports.trim()) { setError('At least one airport code is required'); return }

    setLoading(true)
    try {
      await onSubmit({
        name: name.trim(),
        airports: airports.split(',').map(a => a.trim().toUpperCase()).filter(Boolean),
        baseline: parseFloat(baseline) || 200,
        flag: '✈️',
        zbordirect_slug: null
      })
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <h3>✈️ Add new destination</h3>
        <form onSubmit={handleSubmit}>
          <div className="modal-field">
            <label>Destination name</label>
            <input
              type="text"
              placeholder="e.g. Barcelona"
              value={name}
              onChange={e => setName(e.target.value)}
              autoFocus
            />
          </div>
          <div className="modal-field">
            <label>IATA Airport codes (comma separated)</label>
            <input
              type="text"
              placeholder="e.g. BCN, MAD"
              value={airports}
              onChange={e => setAirports(e.target.value)}
            />
          </div>
          <div className="modal-field">
            <label>Baseline price (€)</label>
            <input
              type="number"
              placeholder="200"
              value={baseline}
              onChange={e => setBaseline(e.target.value)}
              min="1"
            />
          </div>

          {error && <div className="modal-error">{error}</div>}

          <div className="modal-actions">
            <button type="submit" className="modal-submit" disabled={loading}>
              {loading ? 'Adding...' : 'Add destination'}
            </button>
            <button type="button" className="modal-cancel" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
