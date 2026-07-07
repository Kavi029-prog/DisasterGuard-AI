import React, { useState, useEffect, useRef } from 'react'
import { Terminal, Trash2, HelpCircle, Activity } from 'lucide-react'

export default function CommandTerminal({ logs, clearLogs, onExecuteCommand }) {
  const [cmdText, setCmdText] = useState('')
  const logsEndRef = useRef(null)

  // Autoscroll to bottom when logs update
  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [logs])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!cmdText.trim()) return
    onExecuteCommand(cmdText)
    setCmdText('')
  }

  const getLogColor = (type) => {
    switch (type) {
      case 'success': return 'var(--color-green)'
      case 'warn': return 'var(--color-red)'
      case 'cmd': return 'var(--color-blue)'
      default: return 'var(--text-secondary)'
    }
  }

  return (
    <footer className="hud-panel" style={{ gridRow: '3', display: 'flex', flexDirection: 'column', height: '180px', overflow: 'hidden' }}>
      {/* Terminal Title Bar */}
      <div 
        style={{ 
          padding: '6px 16px', 
          borderBottom: '1px solid rgba(0, 210, 255, 0.15)', 
          background: 'rgba(4, 8, 20, 0.5)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <div className="hud-title" style={{ fontSize: '0.75rem', color: 'var(--color-blue)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Terminal style={{ width: '14px', height: '14px' }} />
          <span>TACTICAL RESPONSE TERMINAL BUFFER</span>
        </div>
        
        {/* Terminal Controls */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            onClick={() => onExecuteCommand('status')}
            className="hud-button" 
            style={{ padding: '2px 8px', fontSize: '0.6rem' }}
          >
            <Activity style={{ width: '10px', height: '10px' }} />
            <span>DIAGNOSTICS</span>
          </button>
          <button 
            onClick={() => onExecuteCommand('help')}
            className="hud-button" 
            style={{ padding: '2px 8px', fontSize: '0.6rem' }}
          >
            <HelpCircle style={{ width: '10px', height: '10px' }} />
            <span>COMMANDS</span>
          </button>
          <button 
            onClick={clearLogs}
            className="hud-button btn-critical" 
            style={{ padding: '2px 8px', fontSize: '0.6rem' }}
          >
            <Trash2 style={{ width: '10px', height: '10px' }} />
            <span>FLUSH BUFFER</span>
          </button>
        </div>
      </div>

      {/* Terminal Stream Output */}
      <div 
        style={{ 
          flex: '1', 
          overflowY: 'auto', 
          padding: '10px 16px', 
          background: 'rgba(2, 4, 10, 0.95)',
          fontFamily: 'var(--font-terminal)',
          fontSize: '0.8rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px'
        }}
      >
        {logs.map((log, idx) => (
          <div key={idx} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', lineHeight: '1.4' }}>
            <span style={{ color: 'var(--text-muted)' }}>
              [{new Date(log.timestamp).toLocaleTimeString('en-US', { hour12: false })}]
            </span>
            <span style={{ color: getLogColor(log.type) }}>
              {log.text}
            </span>
          </div>
        ))}
        <div ref={logsEndRef} />
      </div>

      {/* Terminal Input Line */}
      <form 
        onSubmit={handleSubmit}
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          padding: '6px 16px', 
          borderTop: '1px solid rgba(0, 210, 255, 0.15)',
          background: 'rgba(4, 8, 20, 0.8)',
          fontFamily: 'var(--font-terminal)'
        }}
      >
        <span className="glow-text-blue" style={{ fontSize: '0.85rem', fontWeight: 'bold', marginRight: '10px' }}>
          DG-SYSTEM@TACTICAL:~$
        </span>
        <input 
          type="text"
          value={cmdText}
          onChange={(e) => setCmdText(e.target.value)}
          placeholder="TYPE 'help' FOR ACTIVE SYSTEM CONTROLS..."
          className="cyber-input"
          style={{ 
            flex: '1', 
            background: 'none', 
            border: 'none', 
            outline: 'none', 
            color: 'var(--color-blue)', 
            boxShadow: 'none',
            fontSize: '0.85rem',
            padding: '2px 0'
          }}
          autoFocus
        />
        <span className="cursor-blink" style={{ color: 'var(--color-blue)', fontWeight: 'bold', fontSize: '0.85rem', marginLeft: '-10px', marginRight: '10px' }}>
          _
        </span>
      </form>
    </footer>
  )
}
