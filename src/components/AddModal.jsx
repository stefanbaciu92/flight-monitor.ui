import { useState, useRef } from 'react'

const API = 'http://178.104.173.131:7070'

export default function AddModal({ onClose, onSubmit }) {
  const [name, setName]           = useState('')
  const [airports, setAirports]   = useState('')
  const [baseline, setBaseline]   = useState('200')
  const [loading, setLoading]     = useState(false)
  const [iataLoading, setIataLoading] = useState(false)
  const [error, setError]         = useState('')
  const iataRef = useRef(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!name.trim())     { setError('Destination name is required'); return }
    if (!airports.trim()) { setError('At least one airport code is required'); return }

    setLoading(true)
    try {
      await onSubmit({
        name:     name.trim(),
        airports: airports.split(',').map(a => a.trim().toUpperCase()).filter(Boolean),
        baseline: parseFloat(baseline) || 200,
        flag:     '✈️',
        zbordirect_slug: null
      })
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  const handleIataFocus = async () => {
    if (!name.trim() || airports.trim()) return   // skip if no name or already filled
    setIataLoading(true)
    try {
      const res  = await fetch(`${API}/airports?query=${encodeURIComponent(name.trim())}`)
      const data = await res.json()
      if (data.iata_codes && data.iata_codes.length > 0) {
        setAirports(data.iata_codes.join(', '))
      } else {
        setError(`No airports found for "${name.trim()}"`)
      }
    } catch {
      setError('Could not fetch airport codes')
    } finally {
      setIataLoading(false)
      setTimeout(() => iataRef.current?.focus(), 0)
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
              placeholder="e.g. Barcelona or Spain"
              value={name}
              onChange={e => { setName(e.target.value); setAirports('') }}
              autoFocus
            />
          </div>

          <div className="modal-field">
            <label>IATA Airport codes (comma separated)</label>
            <div className="iata-input-wrap">
              <input
                ref={iataRef}
                type="text"
                placeholder={iataLoading ? 'Searching airports…' : 'Click to auto-fill from destination name'}
                value={airports}
                onChange={e => setAirports(e.target.value)}
                onFocus={handleIataFocus}
                disabled={iataLoading}
                className={iataLoading ? 'iata-loading' : ''}
              />
              {iataLoading && <span className="iata-spinner" />}
            </div>
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
            <button type="submit" className="modal-submit" disabled={loading || iataLoading}>
              {loading ? 'Adding…' : 'Add destination'}
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
