import React, { useState } from 'react'
import { Search, Flame, Droplets, AlertTriangle, Wind, ShieldAlert, PlusCircle, AlertCircle } from 'lucide-react'

export default function IncidentConsole({ incidents, selectedId, onSelect, onCreate }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterSeverity, setFilterSeverity] = useState('all')
  const [showSimForm, setShowSimForm] = useState(false)
  
  // Simulation form states
  const [newName, setNewName] = useState('')
  const [newType, setNewType] = useState('wildfire')
  const [newSeverity, setNewSeverity] = useState('major')
  const [newLat, setNewLat] = useState('34.052')
  const [newLng, setNewLng] = useState('-118.243')
  const [newDesc, setNewDesc] = useState('')

  const handleGetGPSLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.")
      return
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setNewLat(position.coords.latitude.toFixed(5))
        setNewLng(position.coords.longitude.toFixed(5))
      },
      (error) => {
        console.warn("Geolocation warning:", error)
        alert(`Failed to retrieve location: ${error.message}`)
      }
    )
  }

  const getIncidentIcon = (type) => {
    switch (type) {
      case 'wildfire': return <Flame style={{ color: 'var(--color-amber)' }} />
      case 'flood': return <Droplets style={{ color: 'var(--color-blue)' }} />
      case 'earthquake': return <AlertCircle style={{ color: 'var(--color-red)' }} />
      case 'hurricane': return <Wind style={{ color: 'var(--color-blue)' }} />
      default: return <ShieldAlert style={{ color: 'var(--color-red)' }} />
    }
  }

  const getSeverityClass = (sev) => {
    if (sev === 'critical') return 'glow-text-red'
    if (sev === 'major') return 'glow-text-amber'
    return 'glow-text-blue'
  }

  const getSeverityBorder = (sev, isSelected) => {
    if (isSelected) {
      if (sev === 'critical') return '1px solid var(--color-red)'
      if (sev === 'major') return '1px solid var(--color-amber)'
      return '1px solid var(--color-blue)'
    }
    return '1px solid rgba(0, 210, 255, 0.1)'
  }

  const handleSimSubmit = (e) => {
    e.preventDefault()
    if (!newName.trim() || !newDesc.trim()) return

    const randomId = `INC-${Math.floor(100 + Math.random() * 900)}`
    const newInc = {
      id: randomId,
      name: newName,
      type: newType,
      severity: newSeverity,
      lat: parseFloat(newLat) || 34.05,
      lng: parseFloat(newLng) || -118.24,
      description: newDesc,
      timestamp: new Date().toISOString(),
      responders: []
    }
    
    onCreate(newInc)
    
    // Reset form
    setNewName('')
    setNewDesc('')
    setShowSimForm(false)
  }

  const filteredIncidents = incidents.filter(inc => {
    const matchesSearch = inc.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          inc.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          inc.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSeverity = filterSeverity === 'all' || inc.severity === filterSeverity
    return matchesSearch && matchesSeverity
  })

  return (
    <aside className="hud-panel" style={{ gridColumn: '1', display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Search and filter toolbar */}
      <div style={{ padding: '14px', borderBottom: '1px solid rgba(0, 210, 255, 0.15)', background: 'rgba(4, 8, 20, 0.4)' }}>
        <div className="hud-title" style={{ fontSize: '0.8rem', color: 'var(--color-blue)', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>INCIDENT CONTROL BUFFER</span>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{filteredIncidents.length} TOTAL</span>
        </div>
        
        <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', position: 'relative' }}>
          <input 
            type="text" 
            placeholder="FILTER BY ID/KEYWORDS..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="cyber-input"
            style={{ paddingLeft: '32px' }}
          />
          <Search style={{ width: '14px', height: '14px', position: 'absolute', left: '10px', top: '12px', color: 'var(--color-blue)', opacity: 0.7 }} />
        </div>

        <div style={{ display: 'flex', gap: '6px' }}>
          {['all', 'critical', 'major', 'minor'].map(sev => (
            <button
              key={sev}
              onClick={() => setFilterSeverity(sev)}
              className="hud-button"
              style={{
                flex: '1',
                padding: '4px 2px',
                fontSize: '0.65rem',
                justifyContent: 'center',
                background: filterSeverity === sev ? 'rgba(0, 210, 255, 0.15)' : 'rgba(0, 210, 255, 0.03)',
                borderColor: filterSeverity === sev ? 'var(--color-blue)' : 'rgba(0, 210, 255, 0.15)',
              }}
            >
              {sev.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Incident List */}
      <div style={{ flex: '1', overflowY: 'auto', padding: '10px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {filteredIncidents.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 10px', color: 'var(--text-secondary)', fontSize: '0.8rem', fontFamily: 'var(--font-terminal)' }}>
            --- NO ACTIVE THREATS MATCHING FILTERS ---
          </div>
        ) : (
          filteredIncidents.map(inc => {
            const isSelected = inc.id === selectedId
            return (
              <div
                key={inc.id}
                onClick={() => onSelect(inc.id)}
                style={{
                  padding: '12px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  background: isSelected ? 'rgba(0, 210, 255, 0.08)' : 'rgba(8, 16, 40, 0.3)',
                  border: getSeverityBorder(inc.severity, isSelected),
                  boxShadow: isSelected ? `inset 0 0 10px rgba(0, 210, 255, 0.05), 0 0 8px rgba(0, 210, 255, 0.1)` : 'none',
                  transition: 'all 0.2s ease',
                  position: 'relative'
                }}
              >
                {/* Visual scan pulse on selected incident */}
                {isSelected && (
                  <div style={{
                    position: 'absolute',
                    top: '0',
                    left: '0',
                    width: '3px',
                    height: '100%',
                    background: inc.severity === 'critical' ? 'var(--color-red)' : inc.severity === 'major' ? 'var(--color-amber)' : 'var(--color-blue)',
                    boxShadow: inc.severity === 'critical' ? '0 0 10px var(--color-red)' : inc.severity === 'major' ? '0 0 10px var(--color-amber)' : '0 0 10px var(--color-blue)'
                  }} />
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {getIncidentIcon(inc.type)}
                    <span style={{ fontFamily: 'var(--font-terminal)', fontSize: '0.85rem', fontWeight: 'bold' }}>{inc.id}</span>
                  </div>
                  <span 
                    className={getSeverityClass(inc.severity)}
                    style={{ 
                      fontFamily: 'var(--font-hud)', 
                      fontSize: '0.65rem', 
                      fontWeight: 'bold', 
                      background: inc.severity === 'critical' ? 'rgba(255, 59, 48, 0.1)' : inc.severity === 'major' ? 'rgba(255, 159, 10, 0.1)' : 'rgba(0, 210, 255, 0.1)',
                      padding: '2px 6px',
                      borderRadius: '2px',
                      textTransform: 'uppercase'
                    }}
                  >
                    {inc.severity}
                  </span>
                </div>

                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#fff', marginBottom: '4px' }}>
                  {inc.name}
                </div>

                <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', lineHeight: '1.3', marginBottom: '8px' }}>
                  {inc.description}
                </p>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', fontFamily: 'var(--font-terminal)', color: 'var(--text-secondary)' }}>
                  <span>COORD: {inc.lat.toFixed(3)}, {inc.lng.toFixed(3)}</span>
                  <span>UNITS: {inc.responders.length}</span>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Simulator toggle and form */}
      <div style={{ borderTop: '1px solid rgba(0, 210, 255, 0.15)', background: 'rgba(4, 8, 20, 0.6)', padding: '10px', maxHeight: showSimForm ? '280px' : 'none', overflowY: showSimForm ? 'auto' : 'visible' }}>
        {!showSimForm ? (
          <button
            onClick={() => setShowSimForm(true)}
            className="hud-button"
            style={{ width: '100%', justifyContent: 'center', gap: '8px' }}
          >
            <PlusCircle style={{ width: '15px', height: '15px' }} />
            <span>SIMULATE DISASTER PROFILE</span>
          </button>
        ) : (
          <form onSubmit={handleSimSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div className="hud-title" style={{ fontSize: '0.75rem', color: 'var(--color-amber)', display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span>SIMULATOR CONTROLS</span>
              <button 
                type="button" 
                onClick={() => setShowSimForm(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontFamily: 'var(--font-terminal)' }}
              >
                [X] CANCEL
              </button>
            </div>

            <div>
              <label className="cyber-label">INCIDENT LABEL / ALIAS</label>
              <input 
                type="text" 
                required 
                placeholder="E.G. PIPELINE FRACTURE A-3"
                value={newName} 
                onChange={e => setNewName(e.target.value)} 
                className="cyber-input"
              />
            </div>

            <div style={{ display: 'flex', gap: '6px' }}>
              <div style={{ flex: '1' }}>
                <label className="cyber-label">DISASTER TYPE</label>
                <select value={newType} onChange={e => setNewType(e.target.value)} className="cyber-select">
                  <option value="wildfire">WILDFIRE</option>
                  <option value="flood">FLOODING</option>
                  <option value="earthquake">EARTHQUAKE</option>
                  <option value="hurricane">HURRICANE</option>
                  <option value="hazmat">HAZMAT LEAK</option>
                </select>
              </div>
              <div style={{ flex: '1' }}>
                <label className="cyber-label">SEVERITY LEVEL</label>
                <select value={newSeverity} onChange={e => setNewSeverity(e.target.value)} className="cyber-select">
                  <option value="minor">MINOR</option>
                  <option value="major">MAJOR</option>
                  <option value="critical">CRITICAL</option>
                </select>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGetGPSLocation}
              className="hud-button"
              style={{ width: '100%', padding: '6px', fontSize: '0.65rem', justifyContent: 'center', borderColor: 'rgba(0, 255, 102, 0.3)', color: 'var(--color-green)', background: 'rgba(0, 255, 102, 0.05)', textTransform: 'uppercase' }}
            >
              Detect My GPS Coordinates
            </button>

            <div style={{ display: 'flex', gap: '6px' }}>
              <div style={{ flex: '1' }}>
                <label className="cyber-label">LATITUDE</label>
                <input 
                  type="number" 
                  step="0.001" 
                  required 
                  value={newLat} 
                  onChange={e => setNewLat(e.target.value)} 
                  className="cyber-input"
                />
              </div>
              <div style={{ flex: '1' }}>
                <label className="cyber-label">LONGITUDE</label>
                <input 
                  type="number" 
                  step="0.001" 
                  required 
                  value={newLng} 
                  onChange={e => setNewLng(e.target.value)} 
                  className="cyber-input"
                />
              </div>
            </div>

            <div>
              <label className="cyber-label">SATELLITE SITREP SUMMARY</label>
              <textarea 
                required 
                placeholder="INCIDENT SCAN BRIEFING..."
                value={newDesc} 
                onChange={e => setNewDesc(e.target.value)} 
                className="cyber-textarea"
                rows="2"
                style={{ resize: 'none', fontFamily: 'var(--font-terminal)' }}
              />
            </div>

            <button 
              type="submit" 
              className="hud-button btn-critical"
              style={{ width: '100%', justifyContent: 'center', marginTop: '4px' }}
            >
              LAUNCH SIMULATED INCIDENT
            </button>
          </form>
        )}
      </div>
    </aside>
  )
}
