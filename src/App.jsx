import { useState } from 'react'
import DealsPage from './pages/DealsPage'
import DestinationsPage from './pages/DestinationsPage'
import './App.css'

export default function App() {
  const [page, setPage] = useState('deals')
  return (
    <div className="app">
      <div className="overlay" />
      <button
        className="toggle-btn"
        onClick={() => setPage(p => p === 'deals' ? 'destinations' : 'deals')}
      >
        {page === 'deals' ? '🌍 Destinations' : '✈️ Deals'}
      </button>
      {page === 'deals' ? <DealsPage /> : <DestinationsPage />}
    </div>
  )
}
