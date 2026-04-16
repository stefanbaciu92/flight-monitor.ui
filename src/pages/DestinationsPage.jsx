import { useEffect, useState } from 'react'
import DestinationCard from '../components/DestinationCard'
import AddModal from '../components/AddModal'
import { useAuth } from '../context/AuthContext'

const API = 'https://linariaskc.com'

export default function DestinationsPage({ showFirstVisitOverlay, onOverlayDismissed }) {
  const { authFetch } = useAuth()
  const [destinations, setDestinations] = useState({})
  const [loading, setLoading]           = useState(true)
  const [showModal, setShowModal]       = useState(false)

  const fetchDestinations = () => {
    authFetch(`${API}/destinations`)
      .then(r => r.json())
      .then(d => { setDestinations(d.destinations || {}); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => { fetchDestinations() }, [])

  const handleDelete = async (name) => {
    if (!confirm(`Remove "${name}" from monitoring?`)) return
    await authFetch(`${API}/destinations/${encodeURIComponent(name)}`, { method: 'DELETE' })
    fetchDestinations()
  }

  const handleAdd = async (payload) => {
    const res = await authFetch(`${API}/destinations/${encodeURIComponent(payload.name)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        airports:        payload.airports,
        baseline:        payload.baseline,
        flag:            payload.flag,
        zbordirect_slug: payload.zbordirect_slug || null,
      }),
    })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.detail || 'Failed to add destination')
    }
    setShowModal(false)
    fetchDestinations()
  }

  const entries = Object.entries(destinations)

  return (
    <div className="page">
      <div className="dest-header-row">
        <h2>Destinations</h2>
        <button className="add-btn" onClick={() => setShowModal(true)}>+ Add</button>
      </div>

      {loading && <p className="loading">Loading destinations...</p>}

      {!loading && entries.length === 0 && (
        <p className="no-data">No destinations configured</p>
      )}

      {!loading && entries.length > 0 && (
        <div className="two-col-grid">
          {entries.map(([name, info]) => (
            <DestinationCard
              key={name}
              name={name}
              info={info}
              onDelete={() => handleDelete(name)}
            />
          ))}
        </div>
      )}

      {showModal && (
        <AddModal
          onClose={() => setShowModal(false)}
          onSubmit={handleAdd}
        />
      )}
    </div>
  )
}
