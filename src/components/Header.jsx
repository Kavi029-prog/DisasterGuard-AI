import React, { useState, useEffect } from 'react'
import { Activity, ShieldAlert, Clock, Cpu, Volume2, VolumeX, Radio, Power } from 'lucide-react'

export default function Header({ 
  isWarningActive, 
  onToggleWarning, 
  isAudioMuted, 
  onToggleAudio, 
  apiStatus 
}) {
  const [localTime, setLocalTime] = useState(new Date())
  const [cpuUsage, setCpuUsage] = useState(42)

  // Update clocks every second
  useEffect(() => {
    const timer = setInterval(() => {
      setLocalTime(new Date())
    }, 1000)

    // Simulate fluctuation of CPU usage
    const cpuTimer = setInterval(() => {
      setCpuUsage(prev => {
        const delta = Math.floor(Math.random() * 9) - 4
        return Math.max(15, Math.min(85, prev + delta))
      })
    }, 3000)

    return () => {
      clearInterval(timer)
      clearInterval(cpuTimer)
    }
  }, [])

  const formatDate = (date, showUtc = false) => {
    const options = {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }
    if (showUtc) {
      return date.toLocaleTimeString('en-US', { ...options, timeZone: 'UTC' }) + ' UTC'
    }
    return date.toLocaleTimeString('en-US', options) + ' LCL'
  }

  return (
    <header className="hud-panel" style={{ padding: '12px 20px', gridRow: '1', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      {/* Left side: System Identity */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <Radio className="glow-text-blue" style={{ width: '20px', height: '20px', animation: 'pulse 1.8s infinite' }} />
        <div>
          <h1 className="hud-title glow-text-blue" style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            DisasterGuard AI <span style={{ color: 'var(--text-secondary)', fontWeight: 300, fontSize: '0.85rem' }}>// Tactical Command Console</span>
          </h1>
          <div style={{ display: 'flex', gap: '10px', marginTop: '2px', fontSize: '0.65rem', fontFamily: 'var(--font-terminal)', color: 'var(--text-secondary)' }}>
            <span>STATION: WEST-HQ-LA</span>
            <span>|</span>
            <span>SECURE SATELLITE LINK [99.7%]</span>
          </div>
        </div>
      </div>

      {/* Middle: Live telemetry HUD */}
      <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
        {/* Warning Indicator */}
        <div 
          onClick={onToggleWarning}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            padding: '6px 12px', 
            borderRadius: '4px',
            background: isWarningActive ? 'rgba(255, 59, 48, 0.15)' : 'rgba(0, 255, 102, 0.05)',
            border: `1px solid ${isWarningActive ? 'rgba(255, 59, 48, 0.4)' : 'rgba(0, 255, 102, 0.2)'}`,
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          <ShieldAlert className={isWarningActive ? 'glow-text-red' : 'glow-text-green'} style={{ width: '16px', height: '16px' }} />
          <span 
            className={isWarningActive ? 'glow-text-red' : 'glow-text-green'} 
            style={{ fontFamily: 'var(--font-hud)', fontSize: '0.75rem', fontWeight: 600 }}
          >
            {isWarningActive ? 'CRITICAL SYSTEM ALERT' : 'SYSTEM STATUS: NOMINAL'}
          </span>
        </div>

        {/* Core telemetry */}
        <div style={{ display: 'flex', gap: '16px', fontFamily: 'var(--font-terminal)', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Cpu style={{ width: '14px', height: '14px', color: 'var(--color-blue)' }} />
            <span>CPU: <strong style={{ color: '#fff' }}>{cpuUsage}%</strong></span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Activity style={{ width: '14px', height: '14px', color: apiStatus === 'online' ? 'var(--color-green)' : 'var(--color-amber)' }} />
            <span>AI GATEWAY: <strong style={{ color: apiStatus === 'online' ? 'var(--color-green)' : 'var(--color-amber)' }}>{apiStatus.toUpperCase()}</strong></span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Clock style={{ width: '14px', height: '14px', color: 'var(--color-blue)' }} />
            <span>{formatDate(localTime, true)}</span>
            <span style={{ opacity: 0.5 }}>/</span>
            <span>{formatDate(localTime, false)}</span>
          </div>
        </div>
      </div>

      {/* Right: Audio / Controls */}
      <div style={{ display: 'flex', gap: '10px' }}>
        <button 
          onClick={onToggleAudio}
          className="hud-button" 
          title={isAudioMuted ? 'Unmute Alarms' : 'Mute Alarms'}
          style={{ padding: '8px' }}
        >
          {isAudioMuted ? <VolumeX style={{ width: '15px', height: '15px' }} /> : <Volume2 style={{ width: '15px', height: '15px' }} />}
        </button>
        <button 
          onClick={onToggleWarning}
          className={`hud-button ${isWarningActive ? 'btn-critical' : 'btn-success'}`}
          style={{ gap: '6px' }}
        >
          <Power style={{ width: '14px', height: '14px' }} />
          <span>ALARM SYSTEM</span>
        </button>
      </div>
    </header>
  )
}
