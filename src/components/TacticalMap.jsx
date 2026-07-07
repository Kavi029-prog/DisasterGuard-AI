import React, { useState, useRef, useEffect } from 'react'
import { Navigation, Compass, Shield, Users, Radio, AlertTriangle } from 'lucide-react'

export default function TacticalMap({ selectedIncident, responders, onDeploy }) {
  const mapRef = useRef(null)
  const [hoverCoords, setHoverCoords] = useState({ lat: 34.052, lng: -118.243 })
  const [selectedResponder, setSelectedResponder] = useState(null)

  // Map limits mapping pixel dimensions to latitude/longitude
  // Center is LA: (34.05, -118.24)
  // Lat range: 33.95 to 34.15
  // Lng range: -118.40 to -118.10
  const latMin = 33.95
  const latMax = 34.15
  const lngMin = -118.40
  const lngMax = -118.10

  const toXY = (lat, lng) => {
    const width = 600
    const height = 500
    // Simple linear interpolation
    const x = ((lng - lngMin) / (lngMax - lngMin)) * width
    // Y is inverted because SVG coords run top-to-bottom
    const y = height - ((lat - latMin) / (latMax - latMin)) * height
    return { x, y }
  }

  const toLatLng = (x, y) => {
    const width = 600
    const height = 500
    const lng = lngMin + (x / width) * (lngMax - lngMin)
    const lat = latMin + ((height - y) / height) * (latMax - latMin)
    return { lat, lng }
  }

  const handleMouseMove = (e) => {
    if (!mapRef.current) return
    const rect = mapRef.current.getBoundingClientRect()
    // Calculate relative coordinates in the 600x500 viewBox
    const x = ((e.clientX - rect.left) / rect.width) * 600
    const y = ((e.clientY - rect.top) / rect.height) * 500
    const { lat, lng } = toLatLng(x, y)
    setHoverCoords({ lat, lng })
  }

  const handleMapClick = () => {
    // Clear selected responder panel when clicking empty map areas
    setSelectedResponder(null)
  }

  // Draw some decorative city grids/vectors
  // Let's create roads, coastlines, and sector lines inside LA
  const coastLinePoints = [
    { lat: 33.95, lng: -118.40 },
    { lat: 33.97, lng: -118.39 },
    { lat: 34.00, lng: -118.38 },
    { lat: 34.02, lng: -118.36 },
    { lat: 34.03, lng: -118.34 },
    { lat: 34.03, lng: -118.30 },
    { lat: 34.01, lng: -118.25 },
    { lat: 33.98, lng: -118.20 },
    { lat: 33.95, lng: -118.15 }
  ]

  const coastPath = coastLinePoints.map(p => {
    const { x, y } = toXY(p.lat, p.lng)
    return `${x},${y}`
  }).join(' ')

  const selectedXY = toXY(selectedIncident.lat, selectedIncident.lng)

  return (
    <section 
      className="hud-panel" 
      style={{ 
        gridColumn: '2', 
        display: 'flex', 
        flexDirection: 'column', 
        height: '100%', 
        position: 'relative',
        userSelect: 'none'
      }}
    >
      {/* HUD Radar Screen Overlay */}
      <div 
        style={{ 
          padding: '10px 16px', 
          borderBottom: '1px solid rgba(0, 210, 255, 0.15)', 
          background: 'rgba(4, 8, 20, 0.4)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <div className="hud-title" style={{ fontSize: '0.8rem', color: 'var(--color-blue)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Compass style={{ width: '15px', height: '15px', animation: 'spin 12s linear infinite' }} />
          <span>TACTICAL SPATIAL HUD [ACTIVE SCANNER]</span>
        </div>
        
        {/* Dynamic Telemetry Box */}
        <div style={{ display: 'flex', gap: '12px', fontSize: '0.65rem', fontFamily: 'var(--font-terminal)', color: 'var(--text-secondary)' }}>
          <span>LAT: {hoverCoords.lat.toFixed(5)}N</span>
          <span>LNG: {hoverCoords.lng.toFixed(5)}W</span>
        </div>
      </div>

      {/* SVG Map Container */}
      <div 
        style={{ flex: '1', position: 'relative', background: '#02050b', overflow: 'hidden' }}
        onMouseMove={handleMouseMove}
        onClick={handleMapClick}
      >
        <svg 
          ref={mapRef}
          viewBox="0 0 600 500" 
          width="100%" 
          height="100%"
          style={{ display: 'block' }}
        >
          {/* Radial grid circles centered on screen */}
          <circle cx="300" cy="250" r="100" fill="none" stroke="rgba(0, 210, 255, 0.04)" strokeDasharray="3,3" />
          <circle cx="300" cy="250" r="200" fill="none" stroke="rgba(0, 210, 255, 0.04)" strokeDasharray="3,3" />
          <circle cx="300" cy="250" r="300" fill="none" stroke="rgba(0, 210, 255, 0.04)" strokeDasharray="3,3" />
          
          {/* Crosshair grids */}
          <line x1="300" y1="0" x2="300" y2="500" stroke="rgba(0, 210, 255, 0.03)" />
          <line x1="0" y1="250" x2="600" y2="250" stroke="rgba(0, 210, 255, 0.03)" />

          {/* Decorative Vector Coastline */}
          <polyline 
            points={coastPath} 
            fill="none" 
            stroke="rgba(0, 210, 255, 0.12)" 
            strokeWidth="2" 
            strokeDasharray="4,8"
          />
          <text x="30" y="470" fill="rgba(0, 210, 255, 0.2)" fontFamily="var(--font-terminal)" fontSize="9">PACIFIC OCEAN INTERCEPT ZONE</text>

          {/* Decorative Roads / Grid Overlay */}
          {/* Main freeway 1 */}
          <line x1="0" y1="120" x2="600" y2="200" stroke="rgba(12, 24, 60, 0.4)" strokeWidth="1.5" />
          {/* Main freeway 2 */}
          <line x1="150" y1="0" x2="250" y2="500" stroke="rgba(12, 24, 60, 0.4)" strokeWidth="1.5" />
          {/* Main freeway 3 */}
          <line x1="450" y1="0" x2="380" y2="500" stroke="rgba(12, 24, 60, 0.4)" strokeWidth="1.5" />

          {/* Active Radar Sweep Line */}
          <g style={{ transformOrigin: '300px 250px', animation: 'spin 8s linear infinite' }}>
            <line x1="300" y1="250" x2="300" y2="-100" stroke="rgba(0, 210, 255, 0.1)" strokeWidth="1" />
            <polygon points="300,250 300,0 200,0" fill="url(#radar-sweep)" opacity="0.15" />
          </g>

          {/* Definitions for Gradients */}
          <defs>
            <radialGradient id="pulse-grad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="var(--color-red)" stopOpacity="0.4" />
              <stop offset="60%" stopColor="var(--color-red)" stopOpacity="0.1" />
              <stop offset="100%" stopColor="var(--color-red)" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="sonar-sweep" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="var(--color-blue)" stopOpacity="0.3" />
              <stop offset="100%" stopColor="var(--color-blue)" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="radar-sweep" x1="1" y1="0" x2="0" y2="0">
              <stop offset="0%" stopColor="var(--color-blue)" stopOpacity="1" />
              <stop offset="100%" stopColor="var(--color-blue)" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Paths connecting dispatched responders to target incidents */}
          {responders.map(resp => {
            if (resp.status !== 'deployed' || !resp.targetIncident) return null
            const respXY = toXY(resp.lat, resp.lng)
            return (
              <g key={`path-${resp.id}`}>
                <line 
                  x1={respXY.x} 
                  y1={respXY.y} 
                  x2={selectedXY.x} 
                  y2={selectedXY.y} 
                  stroke="rgba(0, 210, 255, 0.25)" 
                  strokeWidth="1.2" 
                  strokeDasharray="3,3" 
                />
                {/* Micro flight indicators along the line */}
                <circle cx={respXY.x + (selectedXY.x - respXY.x) * 0.5} cy={respXY.y + (selectedXY.y - respXY.y) * 0.5} r="2.5" fill="var(--color-blue)">
                  <animate attributeName="opacity" values="0.2;1;0.2" dur="1.5s" repeatCount="indefinite" />
                </circle>
              </g>
            )
          })}

          {/* Pulse Alert around the Selected Incident */}
          <circle 
            cx={selectedXY.x} 
            cy={selectedXY.y} 
            r="45" 
            fill="url(#pulse-grad)" 
          />
          <circle 
            cx={selectedXY.x} 
            cy={selectedXY.y} 
            r="70" 
            fill="none" 
            stroke="var(--color-red)" 
            strokeWidth="0.8" 
            opacity="0.3"
            style={{ transformOrigin: `${selectedXY.x}px ${selectedXY.y}px`, animation: 'map-sonar 2.5s infinite linear' }}
          />

          {/* selected incident lock reticle */}
          <g>
            {/* Corner brackets */}
            <path d={`M ${selectedXY.x - 14} ${selectedXY.y - 6} L ${selectedXY.x - 14} ${selectedXY.y - 14} L ${selectedXY.x - 6} ${selectedXY.y - 14}`} fill="none" stroke="var(--color-red)" strokeWidth="1.5" />
            <path d={`M ${selectedXY.x + 14} ${selectedXY.y - 6} L ${selectedXY.x + 14} ${selectedXY.y - 14} L ${selectedXY.x + 6} ${selectedXY.y - 14}`} fill="none" stroke="var(--color-red)" strokeWidth="1.5" />
            <path d={`M ${selectedXY.x - 14} ${selectedXY.y + 6} L ${selectedXY.x - 14} ${selectedXY.y + 14} L ${selectedXY.x - 6} ${selectedXY.y + 14}`} fill="none" stroke="var(--color-red)" strokeWidth="1.5" />
            <path d={`M ${selectedXY.x + 14} ${selectedXY.y + 6} L ${selectedXY.x + 14} ${selectedXY.y + 14} L ${selectedXY.x + 6} ${selectedXY.y + 14}`} fill="none" stroke="var(--color-red)" strokeWidth="1.5" />
            
            <circle cx={selectedXY.x} cy={selectedXY.y} r="2.5" fill="var(--color-red)" />
          </g>

          {/* Plotting all responder nodes */}
          {responders.map(resp => {
            const { x, y } = toXY(resp.lat, resp.lng)
            const isSelected = selectedResponder && selectedResponder.id === resp.id
            const isAssignedToThis = resp.targetIncident === selectedIncident.id

            return (
              <g 
                key={resp.id} 
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedResponder(resp)
                }}
                style={{ cursor: 'pointer' }}
              >
                {/* Node outer pulse */}
                {resp.status === 'deployed' && (
                  <circle cx={x} cy={y} r="8" fill="none" stroke={isAssignedToThis ? 'var(--color-blue)' : 'var(--color-green)'} strokeWidth="1" opacity="0.5">
                    <animate attributeName="r" values="6;14;6" dur="2s" repeatCount="indefinite" />
                  </circle>
                )}

                {/* Node icon shape */}
                {resp.type === 'drone' ? (
                  <polygon 
                    points={`${x},${y-7} ${x+6},${y+4} ${x-6},${y+4}`} 
                    fill={isSelected ? '#fff' : resp.status === 'deployed' ? 'var(--color-blue)' : 'var(--color-green)'}
                    stroke="rgba(0,0,0,0.5)"
                    strokeWidth="0.5"
                  />
                ) : resp.type === 'hazmat' ? (
                  <circle 
                    cx={x} 
                    cy={y} 
                    r="5" 
                    fill={isSelected ? '#fff' : resp.status === 'deployed' ? 'var(--color-amber)' : 'var(--color-green)'}
                    stroke="rgba(0,0,0,0.5)"
                    strokeWidth="0.5"
                  />
                ) : (
                  <rect 
                    x={x-5} 
                    y={y-5} 
                    width="10" 
                    height="10" 
                    fill={isSelected ? '#fff' : resp.status === 'deployed' ? 'var(--color-red)' : 'var(--color-green)'}
                    stroke="rgba(0,0,0,0.5)"
                    strokeWidth="0.5"
                    transform={`rotate(45, ${x}, ${y})`}
                  />
                )}

                {/* Label text */}
                <text 
                  x={x + 10} 
                  y={y + 3} 
                  fill={isAssignedToThis ? 'var(--color-blue)' : '#9ca3af'} 
                  fontFamily="var(--font-terminal)" 
                  fontSize="8"
                  fontWeight={isAssignedToThis ? 'bold' : 'normal'}
                >
                  {resp.id}
                </text>
              </g>
            )
          })}
        </svg>

        {/* Selected Incident Information Overlay */}
        <div 
          className="hud-panel" 
          style={{ 
            position: 'absolute', 
            top: '12px', 
            left: '12px', 
            padding: '8px 12px', 
            background: 'rgba(4, 8, 20, 0.85)',
            border: '1px solid rgba(255, 59, 48, 0.3)',
            maxWidth: '220px',
            pointerEvents: 'none'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.65rem', fontFamily: 'var(--font-terminal)', color: 'var(--color-red)', fontWeight: 'bold' }}>
            <AlertTriangle style={{ width: '12px', height: '12px' }} />
            <span>INCIDENT LOCKED</span>
          </div>
          <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#fff', margin: '3px 0' }}>
            {selectedIncident.name}
          </div>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-terminal)' }}>
            SEV: <span className="glow-text-red">{selectedIncident.severity.toUpperCase()}</span> | LAT: {selectedIncident.lat.toFixed(4)}
          </div>
        </div>

        {/* Selected Responder Management Card Overlay */}
        {selectedResponder && (
          <div 
            className="hud-panel" 
            style={{ 
              position: 'absolute', 
              bottom: '12px', 
              right: '12px', 
              padding: '12px', 
              background: 'rgba(4, 8, 20, 0.95)',
              border: '1px solid var(--color-blue)',
              width: '240px',
              zIndex: 100
            }}
          >
            <div className="hud-title" style={{ fontSize: '0.75rem', color: 'var(--color-blue)', marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
              <span>UNIT TELEMETRY</span>
              <button 
                onClick={() => setSelectedResponder(null)}
                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontFamily: 'var(--font-terminal)' }}
              >
                [X]
              </button>
            </div>

            <div style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#fff', marginBottom: '4px' }}>
              {selectedResponder.name}
            </div>
            
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-terminal)', display: 'flex', flexDirection: 'column', gap: '3px', marginBottom: '10px' }}>
              <span>ID: <strong style={{ color: '#fff' }}>{selectedResponder.id}</strong></span>
              <span>TYPE: {selectedResponder.type.toUpperCase()}</span>
              <span>LAT/LNG: {selectedResponder.lat.toFixed(4)}, {selectedResponder.lng.toFixed(4)}</span>
              <span>
                STATUS: 
                <strong 
                  className={selectedResponder.status === 'deployed' ? 'glow-text-blue' : 'glow-text-green'} 
                  style={{ marginLeft: '4px' }}
                >
                  {selectedResponder.status.toUpperCase()}
                </strong>
              </span>
              {selectedResponder.status === 'deployed' && (
                <span>ASSIGNMENT: {selectedResponder.targetIncident}</span>
              )}
            </div>

            {selectedResponder.status === 'standby' ? (
              <button
                onClick={() => {
                  onDeploy(selectedResponder.id, selectedIncident.id)
                  setSelectedResponder(null)
                }}
                className="hud-button btn-success"
                style={{ width: '100%', fontSize: '0.7rem', justifyContent: 'center' }}
              >
                DISPATCH TO FOCUS ZONE
              </button>
            ) : (
              <div style={{ fontSize: '0.7rem', color: 'var(--color-blue)', textAlign: 'center', fontFamily: 'var(--font-terminal)', border: '1px dashed rgba(0, 210, 255, 0.3)', padding: '6px' }}>
                DISPATCHED TO {selectedResponder.targetIncident} <br />
                <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>Use terminal or chat to recall</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Grid footer info */}
      <div 
        style={{ 
          padding: '8px 16px', 
          borderTop: '1px solid rgba(0, 210, 255, 0.15)', 
          background: 'rgba(4, 8, 20, 0.4)',
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '0.65rem',
          fontFamily: 'var(--font-terminal)',
          color: 'var(--text-secondary)'
        }}
      >
        <div style={{ display: 'flex', gap: '14px' }}>
          <span>GRID SEC: LA-SW-GRID-02</span>
          <span>SCALE: 1:50,000</span>
        </div>
        <div>
          <span className="glow-text-green">ACTIVE UNITS STANDBY: {responders.filter(r => r.status === 'standby').length}</span>
        </div>
      </div>
    </section>
  )
}
