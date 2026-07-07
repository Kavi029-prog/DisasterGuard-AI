import React, { useState, useEffect, useCallback } from 'react'
import Header from './components/Header.jsx'
import IncidentConsole from './components/IncidentConsole.jsx'
import TacticalMap from './components/TacticalMap.jsx'
import AIAssistant from './components/AIAssistant.jsx'
import CommandTerminal from './components/CommandTerminal.jsx'

const DEFAULT_INCIDENTS = [
  {
    id: 'INC-104',
    name: 'Sector 4 Wildfire Escalation',
    type: 'wildfire',
    severity: 'critical',
    lat: 34.08,
    lng: -118.29,
    description: 'Dry brush fire spreading rapidly due to Santa Ana winds. Threatening residential buffer zones.',
    timestamp: '2026-07-07T04:20:00Z',
    responders: ['resp-1']
  },
  {
    id: 'INC-105',
    name: 'Industrial District Chemical Spill',
    type: 'hazmat',
    severity: 'major',
    lat: 34.01,
    lng: -118.30,
    description: 'Chlorine leak reported from storage warehouse facility. Evacuation radius set to 500 meters.',
    timestamp: '2026-07-07T04:45:00Z',
    responders: []
  },
  {
    id: 'INC-106',
    name: 'Zone B Flash Flood Risk',
    type: 'flood',
    severity: 'minor',
    lat: 34.04,
    lng: -118.21,
    description: 'Rising water levels in the local reservoir basin exceeding critical spill thresholds.',
    timestamp: '2026-07-07T04:58:00Z',
    responders: ['resp-2']
  }
]

const DEFAULT_RESPONDERS = [
  { id: 'resp-1', name: 'Drone Recon Squadron Alpha', type: 'drone', status: 'deployed', lat: 34.07, lng: -118.27, targetIncident: 'INC-104' },
  { id: 'resp-2', name: 'Hazmat Tactical Response Team 1', type: 'hazmat', status: 'deployed', lat: 34.03, lng: -118.22, targetIncident: 'INC-106' },
  { id: 'resp-3', name: 'Rescue Helicopter Medic-4', type: 'chopper', status: 'standby', lat: 34.00, lng: -118.15, targetIncident: null },
  { id: 'resp-4', name: 'Heavy Excavator Support Unit B', type: 'heavy', status: 'standby', lat: 34.10, lng: -118.35, targetIncident: null }
]

export default function App() {
  const [incidents, setIncidents] = useState(DEFAULT_INCIDENTS)
  const [selectedIncidentId, setSelectedIncidentId] = useState('INC-104')
  const [responders, setResponders] = useState(DEFAULT_RESPONDERS)
  const [isWarningActive, setIsWarningActive] = useState(true)
  const [isAudioMuted, setIsAudioMuted] = useState(true)
  const [apiStatus, setApiStatus] = useState('online') // online | offline | simulating
  const [terminalLogs, setTerminalLogs] = useState([
    { text: 'DISASTERGUARD AI // SYSTEM BOOT: SECURE ENCRYPTED CHANNEL ESTABLISHED', type: 'success', timestamp: new Date(Date.now() - 10000).toISOString() },
    { text: 'GEOSPATIAL GRAPHICS PIPELINE: ONLINE', type: 'info', timestamp: new Date(Date.now() - 8000).toISOString() },
    { text: 'CONNECTING TO GEMINI TACTICAL AGENT...', type: 'info', timestamp: new Date(Date.now() - 6000).toISOString() },
    { text: 'AI CORE LINK STABILIZED - ENGINE: gemini-2.5-flash', type: 'success', timestamp: new Date(Date.now() - 4000).toISOString() },
    { text: 'ALERT: 3 Active disasters identified in console buffer. Systems placed on HIGH ALERT.', type: 'warn', timestamp: new Date().toISOString() }
  ])

  // Sound generator using Web Audio API to prevent loading external assets
  const playAlertSound = useCallback((frequency, type, duration) => {
    if (isAudioMuted) return
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)()
      const oscillator = audioCtx.createOscillator()
      const gainNode = audioCtx.createGain()

      oscillator.type = type
      oscillator.frequency.value = frequency
      gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration)

      oscillator.connect(gainNode)
      gainNode.connect(audioCtx.destination)

      oscillator.start()
      oscillator.stop(audioCtx.currentTime + duration)
    } catch (e) {
      console.warn('Audio synthesis failed:', e)
    }
  }, [isAudioMuted])

  // Play alert sounds periodically if warning is active
  useEffect(() => {
    if (!isWarningActive || isAudioMuted) return
    const interval = setInterval(() => {
      // High alarm tone
      playAlertSound(880, 'sawtooth', 0.15)
      setTimeout(() => playAlertSound(660, 'sawtooth', 0.15), 180)
    }, 3000)
    return () => clearInterval(interval)
  }, [isWarningActive, isAudioMuted, playAlertSound])

  const addLog = useCallback((text, type = 'info') => {
    setTerminalLogs(prev => [
      ...prev,
      { text, type, timestamp: new Date().toISOString() }
    ])
    // Synthesize subtle command logging sound
    if (type === 'cmd') playAlertSound(440, 'sine', 0.05)
    else if (type === 'warn') playAlertSound(330, 'square', 0.2)
    else if (type === 'success') playAlertSound(600, 'sine', 0.1)
  }, [playAlertSound])

  const handleSelectIncident = (id) => {
    setSelectedIncidentId(id)
    const inc = incidents.find(i => i.id === id)
    if (inc) {
      addLog(`Selected disaster file: ${inc.id} - ${inc.name}`, 'info')
    }
  }

  const handleCreateIncident = (newInc) => {
    setIncidents(prev => [newInc, ...prev])
    setSelectedIncidentId(newInc.id)
    addLog(`NEW INCIDENT SPOTTED: [${newInc.id}] ${newInc.name} - Severity: ${newInc.severity.toUpperCase()}`, 'warn')
    if (newInc.severity === 'critical') {
      setIsWarningActive(true)
    }
  }

  const handleDeployResponder = (responderId, incidentId) => {
    const inc = incidents.find(i => i.id === incidentId)
    const resp = responders.find(r => r.id === responderId)
    
    if (!inc || !resp) {
      addLog(`Failed deployment: invalid incident (${incidentId}) or unit (${responderId}) ID.`, 'warn')
      return
    }

    setResponders(prev => prev.map(r => {
      if (r.id === responderId) {
        return {
          ...r,
          status: 'deployed',
          targetIncident: incidentId,
          lat: inc.lat + (Math.random() - 0.5) * 0.015, // Move near incident coordinates
          lng: inc.lng + (Math.random() - 0.5) * 0.015
        }
      }
      return r
    }))

    setIncidents(prev => prev.map(i => {
      if (i.id === incidentId) {
        return {
          ...i,
          responders: i.responders.includes(responderId) ? i.responders : [...i.responders, responderId]
        }
      }
      return i
    }))

    addLog(`SUCCESS: Dispatched ${resp.name} to ${inc.id} (${inc.name}). Coordinates updated.`, 'success')
  }

  const handleRecallResponder = (responderId) => {
    const resp = responders.find(r => r.id === responderId)
    if (!resp) return

    setResponders(prev => prev.map(r => {
      if (r.id === responderId) {
        return {
          ...r,
          status: 'standby',
          targetIncident: null,
          lat: DEFAULT_RESPONDERS.find(dr => dr.id === responderId).lat, // Return to base coordinates
          lng: DEFAULT_RESPONDERS.find(dr => dr.id === responderId).lng
        }
      }
      return r
    }))

    if (resp.targetIncident) {
      setIncidents(prev => prev.map(i => {
        if (i.id === resp.targetIncident) {
          return {
            ...i,
            responders: i.responders.filter(id => id !== responderId)
          }
        }
        return i
      }))
      addLog(`RECALL: ${resp.name} recalled from ${resp.targetIncident}. Returning to base.`, 'info')
    }
  }

  const handleToggleWarning = () => {
    setIsWarningActive(!isWarningActive)
    addLog(`SYSTEM ALARM STATUS: ${!isWarningActive ? 'ARMED' : 'DEACTIVATED'}`, !isWarningActive ? 'warn' : 'info')
  }

  const selectedIncident = incidents.find(i => i.id === selectedIncidentId) || incidents[0]

  return (
    <div className={`dashboard-grid ${isWarningActive ? 'blink-warning' : ''}`}>
      <Header 
        isWarningActive={isWarningActive} 
        onToggleWarning={handleToggleWarning}
        isAudioMuted={isAudioMuted}
        onToggleAudio={() => setIsAudioMuted(!isAudioMuted)}
        apiStatus={apiStatus}
      />
      
      <main className="console-workspace">
        <IncidentConsole 
          incidents={incidents}
          selectedId={selectedIncidentId}
          onSelect={handleSelectIncident}
          onCreate={handleCreateIncident}
        />
        
        <TacticalMap 
          selectedIncident={selectedIncident}
          responders={responders}
          onDeploy={handleDeployResponder}
        />
        
        <AIAssistant 
          incident={selectedIncident}
          responders={responders}
          onDeploy={handleDeployResponder}
          apiStatus={apiStatus}
          setApiStatus={setApiStatus}
          addLog={addLog}
        />
      </main>

      <CommandTerminal 
        logs={terminalLogs}
        clearLogs={() => setTerminalLogs([])}
        onExecuteCommand={(cmd) => {
          addLog(`> ${cmd}`, 'cmd')
          // Basic command parser
          const tokens = cmd.toLowerCase().trim().split(' ')
          const action = tokens[0]

          if (action === 'help') {
            addLog('SYSTEM COMMAND BUFFER SUMMARY:', 'success')
            addLog('  help                     - Display available terminal controls')
            addLog('  list                     - Render all active tactical disasters')
            addLog('  select [id]              - Target a specific incident profile (e.g. select inc-105)')
            addLog('  deploy [resp_id] [inc_id]- Dispatch responder unit to tactical coordinates')
            addLog('  recall [resp_id]         - Return dispatched responder units to base station')
            addLog('  status                   - Query satellite status, latency & AI telemetry')
            addLog('  clear                    - Flush command output terminal buffer')
            addLog('  alert                    - Toggle status alarm blink lines')
          } else if (action === 'list') {
            addLog('TACTICAL DISASTER DATABASE:', 'info')
            incidents.forEach(inc => {
              addLog(`  [${inc.id}] ${inc.name} | Type: ${inc.type} | Severity: ${inc.severity.toUpperCase()}`, 'info')
            })
          } else if (action === 'select') {
            const id = tokens[1]?.toUpperCase()
            if (!id) {
              addLog('ERROR: "select" command requires target ID parameter (e.g., select INC-105)', 'warn')
            } else {
              const target = incidents.find(i => i.id === id)
              if (target) {
                handleSelectIncident(id)
              } else {
                addLog(`ERROR: Disaster ID [${id}] not registered in local telemetry.`, 'warn')
              }
            }
          } else if (action === 'deploy') {
            const respId = tokens[1]
            const incId = tokens[2]?.toUpperCase()
            if (!respId || !incId) {
              addLog('ERROR: "deploy" requires responder and incident parameters (e.g. deploy resp-3 INC-105)', 'warn')
            } else {
              const r = responders.find(u => u.id === respId)
              const i = incidents.find(dis => dis.id === incId)
              if (!r) addLog(`ERROR: Responder Unit [${respId}] invalid.`, 'warn')
              else if (!i) addLog(`ERROR: Disaster Target [${incId}] invalid.`, 'warn')
              else handleDeployResponder(respId, incId)
            }
          } else if (action === 'recall') {
            const respId = tokens[1]
            if (!respId) {
              addLog('ERROR: "recall" command requires responder ID (e.g. recall resp-1)', 'warn')
            } else {
              const r = responders.find(u => u.id === respId)
              if (r) {
                handleRecallResponder(respId)
              } else {
                addLog(`ERROR: Responder Unit [${respId}] invalid.`, 'warn')
              }
            }
          } else if (action === 'status') {
            addLog('DIAGNOSTIC TELEMETRY STREAM:', 'success')
            addLog(`  SYSTEM SATELLITE: ORBITAL LINK STABLE (98.4% uptime)`)
            addLog(`  NODE LATENCY: ${Math.floor(Math.random() * 40) + 12}ms`)
            addLog(`  GEMINI API GATEWAY: ${apiStatus.toUpperCase()}`)
            addLog(`  ACTIVE UNITS DEPLOYED: ${responders.filter(r => r.status === 'deployed').length}/${responders.length}`)
          } else if (action === 'clear') {
            setTerminalLogs([])
          } else if (action === 'alert') {
            handleToggleWarning()
          } else {
            addLog(`COMMAND NOT VALID: "${action}". Type "help" for syntax list.`, 'warn')
          }
        }}
      />
    </div>
  )
}
