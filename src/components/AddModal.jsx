import { useState, useRef } from 'react'

const API = 'http://178.104.173.131:7070'

// Country name (lowercase) → capital city for IATA lookup
const COUNTRY_CAPITALS = {
  'afghanistan': 'Kabul', 'albania': 'Tirana', 'algeria': 'Algiers',
  'andorra': 'Andorra la Vella', 'angola': 'Luanda', 'argentina': 'Buenos Aires',
  'armenia': 'Yerevan', 'australia': 'Sydney', 'austria': 'Vienna',
  'azerbaijan': 'Baku', 'bahrain': 'Manama', 'bangladesh': 'Dhaka',
  'belarus': 'Minsk', 'belgium': 'Brussels', 'bolivia': 'La Paz',
  'bosnia': 'Sarajevo', 'botswana': 'Gaborone', 'brazil': 'Sao Paulo',
  'bulgaria': 'Sofia', 'cambodia': 'Phnom Penh', 'cameroon': 'Yaounde',
  'canada': 'Toronto', 'chile': 'Santiago', 'china': 'Beijing',
  'colombia': 'Bogota', 'congo': 'Kinshasa', 'costa rica': 'San Jose',
  'croatia': 'Zagreb', 'cuba': 'Havana', 'cyprus': 'Nicosia',
  'czech republic': 'Prague', 'czechia': 'Prague', 'denmark': 'Copenhagen',
  'ecuador': 'Quito', 'egypt': 'Cairo', 'ethiopia': 'Addis Ababa',
  'finland': 'Helsinki', 'france': 'Paris', 'georgia': 'Tbilisi',
  'germany': 'Berlin', 'ghana': 'Accra', 'greece': 'Athens',
  'guatemala': 'Guatemala City', 'honduras': 'Tegucigalpa', 'hungary': 'Budapest',
  'iceland': 'Reykjavik', 'india': 'New Delhi', 'indonesia': 'Jakarta',
  'iran': 'Tehran', 'iraq': 'Baghdad', 'ireland': 'Dublin',
  'israel': 'Tel Aviv', 'italy': 'Rome', 'jamaica': 'Kingston',
  'japan': 'Tokyo', 'jordan': 'Amman', 'kazakhstan': 'Almaty',
  'kenya': 'Nairobi', 'kosovo': 'Pristina', 'kuwait': 'Kuwait City',
  'kyrgyzstan': 'Bishkek', 'laos': 'Vientiane', 'latvia': 'Riga',
  'lebanon': 'Beirut', 'libya': 'Tripoli', 'lithuania': 'Vilnius',
  'luxembourg': 'Luxembourg City', 'madagascar': 'Antananarivo',
  'malaysia': 'Kuala Lumpur', 'maldives': 'Male', 'malta': 'Valletta',
  'mexico': 'Mexico City', 'moldova': 'Chisinau', 'mongolia': 'Ulaanbaatar',
  'montenegro': 'Podgorica', 'morocco': 'Casablanca', 'mozambique': 'Maputo',
  'myanmar': 'Yangon', 'namibia': 'Windhoek', 'nepal': 'Kathmandu',
  'netherlands': 'Amsterdam', 'new zealand': 'Auckland', 'nicaragua': 'Managua',
  'nigeria': 'Lagos', 'north korea': 'Pyongyang', 'north macedonia': 'Skopje',
  'norway': 'Oslo', 'oman': 'Muscat', 'pakistan': 'Karachi',
  'panama': 'Panama City', 'paraguay': 'Asuncion', 'peru': 'Lima',
  'philippines': 'Manila', 'poland': 'Warsaw', 'portugal': 'Lisbon',
  'qatar': 'Doha', 'romania': 'Bucharest', 'russia': 'Moscow',
  'saudi arabia': 'Riyadh', 'senegal': 'Dakar', 'serbia': 'Belgrade',
  'singapore': 'Singapore', 'slovakia': 'Bratislava', 'slovenia': 'Ljubljana',
  'somalia': 'Mogadishu', 'south africa': 'Johannesburg', 'south korea': 'Seoul',
  'korea': 'Seoul', 'spain': 'Madrid', 'sri lanka': 'Colombo',
  'sudan': 'Khartoum', 'sweden': 'Stockholm', 'switzerland': 'Zurich',
  'syria': 'Damascus', 'taiwan': 'Taipei', 'tajikistan': 'Dushanbe',
  'tanzania': 'Dar es Salaam', 'thailand': 'Bangkok', 'tunisia': 'Tunis',
  'turkey': 'Istanbul', 'turkiye': 'Istanbul', 'turkmenistan': 'Ashgabat',
  'uganda': 'Entebbe', 'ukraine': 'Kyiv', 'united arab emirates': 'Dubai',
  'uae': 'Dubai', 'united kingdom': 'London', 'uk': 'London',
  'united states': 'New York', 'usa': 'New York', 'uruguay': 'Montevideo',
  'uzbekistan': 'Tashkent', 'venezuela': 'Caracas', 'vietnam': 'Ho Chi Minh City',
  'yemen': 'Sanaa', 'zambia': 'Lusaka', 'zimbabwe': 'Harare',
}

export default function AddModal({ onClose, onSubmit }) {
  const [name, setName]               = useState('')
  const [airports, setAirports]       = useState('')
  const [baseline, setBaseline]       = useState('200')
  const [loading, setLoading]         = useState(false)
  const [iataLoading, setIataLoading] = useState(false)
  const [iataAttempted, setIataAttempted] = useState(false)
  const [iataNotFound, setIataNotFound]   = useState(false)
  const [capitalHint, setCapitalHint]     = useState(null)
  const [error, setError]             = useState('')
  const iataRef = useRef(null)

  const iataList = airports
    .split(',')
    .map(a => a.trim().toUpperCase())
    .filter(a => a.length > 0)

  const removeIata = (code) => {
    const updated = iataList.filter(a => a !== code)
    setAirports(updated.join(', '))
  }

  const handleNameChange = (e) => {
    setName(e.target.value)
    setAirports('')
    setIataAttempted(false)
    setIataNotFound(false)
    setCapitalHint(null)
    setError('')
  }

  const handleIataFocus = async () => {
    if (!name.trim() || airports.trim() || iataAttempted) return
    setIataAttempted(true)
    setIataLoading(true)
    setIataNotFound(false)
    setCapitalHint(null)

    const trimmed = name.trim()
    const capital = COUNTRY_CAPITALS[trimmed.toLowerCase()]
    const query   = capital || trimmed

    if (capital) setCapitalHint(capital)

    try {
      const res  = await fetch(`${API}/airports?query=${encodeURIComponent(query)}`)
      const data = await res.json()
      if (data.iata_codes?.length > 0) {
        setAirports(data.iata_codes.join(', '))
      } else {
        setIataNotFound(true)
      }
    } catch {
      setIataNotFound(true)
    } finally {
      setIataLoading(false)
      setTimeout(() => iataRef.current?.focus(), 0)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!name.trim())        { setError('Destination name is required'); return }
    if (iataList.length < 1) { setError('At least one airport code is required'); return }

    setLoading(true)
    try {
      await onSubmit({
        name:            name.trim(),
        airports:        iataList,
        baseline:        parseFloat(baseline) || 200,
        flag:            '✈️',
        zbordirect_slug: null,
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
              placeholder="e.g. Barcelona or Spain"
              value={name}
              onChange={handleNameChange}
              autoFocus
            />
          </div>

          <div className="modal-field">
            <label>IATA Airport codes</label>

            {iataList.length > 0 && (
              <div className="iata-tags">
                {iataList.map(code => (
                  <span key={code} className="iata-tag">
                    {code}
                    <button
                      type="button"
                      className="iata-tag-remove"
                      onClick={() => removeIata(code)}
                      aria-label={`Remove ${code}`}
                    >×</button>
                  </span>
                ))}
              </div>
            )}

            <div className="iata-input-wrap">
              <input
                ref={iataRef}
                type="text"
                placeholder={
                  iataLoading  ? 'Searching airports…' :
                  iataNotFound ? 'Type codes manually, e.g. BCN, MAD' :
                                 'Click to auto-fill, or type manually'
                }
                value={airports}
                onChange={e => setAirports(e.target.value)}
                onFocus={handleIataFocus}
                disabled={iataLoading}
                className={iataLoading ? 'iata-loading' : ''}
              />
              {iataLoading && <span className="iata-spinner" />}
            </div>

            {capitalHint && !iataNotFound && (
              <p style={{
                fontSize: '0.75rem', marginTop: '6px',
                color: 'rgba(167,139,250,0.9)',
              }}>
                Country detected — showing airports for {capitalHint}
              </p>
            )}

            {iataNotFound && (
              <p style={{
                fontSize: '0.75rem', marginTop: '6px',
                color: 'rgba(251,191,36,0.85)',
              }}>
                No airports found for "{capitalHint || name.trim()}" — enter codes manually above
              </p>
            )}
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
