import React, { useState } from 'react'
import { Send, MessageSquare, ShieldAlert, Cpu, Check, AlertCircle, FileText } from 'lucide-react'

const MOCK_AI_RESPONSES = {
  wildfire: {
    analysis: "Dry Santa Ana wind gusts are accelerating the flame front along high canyons. Risk of crown fires and structural loss in perimeter buffers is critical. Escalation potential is estimated at 85% within next 2 hours.",
    resources: [
      "2x Aerial Fire Tanker (Water/Retardant Drop)",
      "3x Forestry Brush Engine Units",
      "1x Containment Bulldozer Crew",
      "Drone Recon Team for infrared perimeter mapping"
    ],
    evacuation: "Establish immediate primary evacuation corridors heading South on Foothill Blvd. Establish cordon at Sector 4 canyon entrance.",
    alert: "URGENT PUBLIC ALERT: Wildfire expanding rapidly. Evacuate all properties in Sector 4 immediately. Proceed South. Do not delay."
  },
  hazmat: {
    analysis: "Gaseous chlorine plume dispersing downwind into the adjacent residential sectors. High inhalation danger. Escalation threat is major if storage tanks lose structural seal under pressure.",
    resources: [
      "1x Decontamination/Hazmat Command Rig",
      "2x Environmental Air Quality Monitoring Trailers",
      "1x Mass Casualty Medical Evac Unit",
      "Drone Recon Team with thermal gas spectrometers"
    ],
    evacuation: "Set a 1-mile exclusion zone around Industrial Warehouse B. Advise downwind residential blocks to shelter-in-place immediately.",
    alert: "CRITICAL SAFETY WARNING: Toxic gas leak reported at Industrial Warehouse B. Shelter in place immediately. Close all windows and HVAC systems."
  },
  flood: {
    analysis: "Reservoir spillways are operating at maximum capacity. Sustained rainfall is projected to compromise earthen levees in Sector B within the hour. Severe urban inundation is expected.",
    resources: [
      "4x High-water Rescue Inflatable Boat Crews",
      "2x Amphibious Cargo Transport Vehicles",
      "1x Sandbag Fortification Crew",
      "Search & Rescue Air Medic Support"
    ],
    evacuation: "Evacuate low-lying river basins in Zone B. Direct residents to higher ground at Sector B Central High School.",
    alert: "URGENT FLOOD ALERT: Earthen levee in Zone B is near capacity. Evacuate low-lying zones immediately to high ground."
  },
  earthquake: {
    analysis: "Aftershocks continue to register between 4.2 and 5.0 magnitude. Significant structural damage reported to concrete bridge pillars. Structural collapse threat is critical for compromised masonry structures.",
    resources: [
      "2x Heavy Structural Search & Rescue Units",
      "3x Canine Search Teams",
      "1x Seismic Ground Shaking Monitoring Rig",
      "Mass Casualty Evac Helicopter Squad"
    ],
    evacuation: "Establish safety cordons around bridges and structures showing active concrete spalling. Establish open-air shelter hubs in city parks.",
    alert: "EARTHQUAKE AFTERSHOCK ADVISORY: Exit buildings showing structural damage immediately. Expect active aftershocks. Stay clear of utility lines."
  },
  hurricane: {
    analysis: "Category 4 storm surge height projected to reach 12 feet. Local seawall has breached. High risk of electrical grid failure across coastal communities.",
    resources: [
      "3x Flood Rescue Boat Squadrons",
      "4x Utility Grid Restoration Crews",
      "1x Emergency Medical Shelter Support Team",
      "Coast Guard Recon Flight Support"
    ],
    evacuation: "Order immediate evacuation of all coastal sectors within 1000m of the shoreline. Cordon coastal bridge access routes.",
    alert: "IMMEDIATE EVACUATION ORDER: Severe storm surge breaching coastal defenses. Evacuate shoreline zones immediately. Seek designated shelters."
  }
}

export default function AIAssistant({ incident, responders, onDeploy, apiStatus, setApiStatus, addLog }) {
  const [loading, setLoading] = useState(false)
  const [strategy, setStrategy] = useState(null)
  const [chatInput, setChatInput] = useState('')
  const [chatHistory, setChatHistory] = useState([
    { role: 'model', text: "Awaiting incident command data. Click 'Generate Response Strategy' or query me directly regarding tactical deployment details." }
  ])

  const generateLocalResponse = (type) => {
    return MOCK_AI_RESPONSES[type] || MOCK_AI_RESPONSES.wildfire
  }

  const getMatchingResponder = (resourceText) => {
    const text = resourceText.toLowerCase()
    if (text.includes('drone') || text.includes('recon')) {
      return responders.find(r => r.type === 'drone')
    }
    if (text.includes('hazmat') || text.includes('chemical') || text.includes('decon') || text.includes('spectrometer')) {
      return responders.find(r => r.type === 'hazmat')
    }
    if (text.includes('helicopter') || text.includes('chopper') || text.includes('medic-4') || text.includes('tanker')) {
      return responders.find(r => r.type === 'chopper')
    }
    if (text.includes('excavator') || text.includes('bulldozer') || text.includes('heavy') || text.includes('crew')) {
      return responders.find(r => r.type === 'heavy')
    }
    return null
  }

  const handleExportSitRep = () => {
    if (!strategy) return
    
    const timestamp = new Date().toISOString()
    const reportText = `==================================================
DISASTERGUARD AI // EMERGENCY SITUATION REPORT
==================================================
GENERATED: ${timestamp}
INCIDENT ID: ${incident.id}
INCIDENT NAME: ${incident.name}
DISASTER TYPE: ${incident.type.toUpperCase()}
SEVERITY LEVEL: ${incident.severity.toUpperCase()}
COORDINATES: ${incident.lat.toFixed(5)} N, ${incident.lng.toFixed(5)} W
--------------------------------------------------

1. THREAT PROFILE ANALYSIS
--------------------------
${strategy.analysis}

2. EVACUATION CORRIDOR
----------------------
${strategy.evacuation}

3. RECOMMENDED DISPATCH CHECKLIST
---------------------------------
${strategy.resources.map((res, i) => `[ ] ${res}`).join('\n')}

4. OFFICIAL BROADCAST BULLETIN
------------------------------
"${strategy.alert}"

==================================================
DG-SYSTEM@TACTICAL // END OF TRANSMISSION
==================================================`

    const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `SITREP_${incident.id}_${new Date().toISOString().split('T')[0]}.txt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    addLog(`SITREP export compiled for ${incident.id}. File downloaded.`, 'success')
  }

  const handleGenerateStrategy = async () => {
    setLoading(true)
    addLog(`Initiating AI strategy synthesis for ${incident.id}...`, 'info')
    
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY || ''
    
    // Check if the API key looks like a placeholder or is missing
    const isMockKey = !apiKey || apiKey.includes('actual_api_key_here') || apiKey === ''

    if (isMockKey) {
      // Run fallback simulation after short delay
      setTimeout(() => {
        const localStrategy = generateLocalResponse(incident.type)
        setStrategy(localStrategy)
        setApiStatus('simulating')
        setLoading(false)
        addLog(`AI Strategy synthesized successfully (Simulation Mode).`, 'success')
        
        // Add summary message to chat
        setChatHistory(prev => [
          ...prev,
          { role: 'model', text: `Tactical strategy generated for ${incident.id}: ${localStrategy.analysis.slice(0, 100)}...` }
        ])
      }, 1500)
      return
    }

    try {
      // Call official Gemini API
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are the DisasterGuard AI Tactical Command Adviser. 
              Analyze the following active incident:
              ID: ${incident.id}
              Name: ${incident.name}
              Type: ${incident.type}
              Severity: ${incident.severity}
              Coordinates: Lat ${incident.lat}, Lng ${incident.lng}
              Situation Report: ${incident.description}
              
              Provide a structured tactical response strategy.
              Return ONLY a JSON object with the following fields (do not write any wrapping markdown ticks or words):
              {
                "analysis": "A detailed threat analysis of the disaster, current risks, and escalation warnings (2-3 sentences)",
                "resources": ["List of specific response units, vehicles, or gear recommended to dispatch"],
                "evacuation": "Clear evacuation routing, cordon radii, and zone priorities (1-2 sentences)",
                "alert": "An urgent, professional community warning broadcast script that local authorities can issue immediately (1-2 sentences)"
              }`
            }]
          }]
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
      
      // Parse JSON from returned text (strip markdown ticks if present)
      const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim()
      const parsedStrategy = JSON.parse(cleanText)
      
      setStrategy(parsedStrategy)
      setApiStatus('online')
      addLog(`AI Strategy generated via live Gemini API for ${incident.id}.`, 'success')
    } catch (err) {
      console.warn("Gemini API call failed, falling back to simulator:", err)
      addLog(`Gemini API connection failed. Reverting to local simulation model.`, 'warn')
      
      // Fallback
      const localStrategy = generateLocalResponse(incident.type)
      setStrategy(localStrategy)
      setApiStatus('simulating')
    } finally {
      setLoading(false)
    }
  }

  const handleSendChat = async (e) => {
    e.preventDefault()
    if (!chatInput.trim()) return

    const userMessage = chatInput
    setChatInput('')
    setChatHistory(prev => [...prev, { role: 'user', text: userMessage }])
    addLog(`Sent query to Tactical Assistant: "${userMessage}"`, 'info')

    setLoading(true)
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY || ''
    const isMockKey = !apiKey || apiKey.includes('actual_api_key_here') || apiKey === ''

    if (isMockKey) {
      // Simulate chat reply after short delay
      setTimeout(() => {
        const msg = userMessage.toLowerCase().trim()
        let reply = ''

        if (msg === 'hello' || msg === 'hey' || msg === 'hi' || msg === 'greetings') {
          const greetings = [
            `Tactical command link established. Ready to assist with the active ${incident.type} (${incident.id}). Ask me about evacuation zones, available response units, or strategy analysis.`,
            `Telemetry channels connected. Operator, how can I assist you with the coordination of ${incident.name}?`,
            `Command advisory link online. Ready to evaluate response procedures for the active hazard.`,
            `Secure terminal active. Satellite status: nominal. Specify directives for incident ${incident.id}.`
          ];
          reply = greetings[Math.floor(Math.random() * greetings.length)];
        } else if (msg.includes('how to use') || msg.includes('help') || msg.includes('guide')) {
          reply = `To operate the console: \n1. Click "Generate Response Strategy" at the top right to analyze the active incident.\n2. Click on a responder unit dot on the map grid to dispatch it, or use the Command Terminal at the bottom.\n3. Create custom disaster simulations using the form in the left sidebar.`
        } else if (msg.includes('incident') || msg.includes('status') || msg.includes('situation')) {
          reply = `Active incident status briefing for ${incident.id} (${incident.name}): ${incident.description} Evaluated severity: ${incident.severity.toUpperCase()} at coordinate sector [${incident.lat}, ${incident.lng}].`
        } else if (msg.includes('responder') || msg.includes('unit') || msg.includes('team')) {
          const standby = responders.filter(r => r.status === 'standby')
          const deployed = responders.filter(r => r.status === 'deployed')
          reply = `Sector telemetry: ${deployed.length} units deployed in response grids, ${standby.length} standby units ready at base stations. Standby units: ${standby.map(s => s.name).join(', ') || 'none'}.`
        } else if (msg.includes('deploy') || msg.includes('dispatch') || msg.includes('send')) {
          reply = `Deployments can be executed by typing 'deploy [responder_id] ${incident.id}' in the terminal console, or clicking 'DISPATCH' on the unit map node.`
        } else if (msg.includes('evacuate') || msg.includes('route') || msg.includes('escape') || msg.includes('exit')) {
          reply = `Primary evacuation vector is designated South/West. Emergency services are maintaining clear corridors. Cordon is set at a 1000m radius.`
        } else {
          // Dynamic fallback
          const templates = [
            `Understood. Analyzing telemetry for ${incident.name}. Recommended course: deploy available teams like ${responders.find(r => r.status === 'standby')?.name || 'base units'} immediately to lock coordinates.`,
            `Processing satellite images for Sector [${incident.lat.toFixed(2)}, ${incident.lng.toFixed(2)}]. Hazard density has expanded. Advise checking evacuation route guidelines.`,
            `Command adviser: standing by. Specify request parameters for hazard ${incident.id} (${incident.type.toUpperCase()}).`
          ]
          reply = templates[Math.floor(Math.random() * templates.length)]
        }

        setChatHistory(prev => [...prev, { role: 'model', text: reply }])
        setLoading(false)
        addLog(`Assistant reply compiled.`, 'success')
      }, 1000)
      return
    }

    try {
      // Call Gemini Chat API
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [
            ...chatHistory.map(ch => ({
              role: ch.role === 'model' ? 'model' : 'user',
              parts: [{ text: ch.text }]
            })),
            {
              role: 'user',
              parts: [{ text: `Regarding the active incident ${incident.id} (${incident.name}): ${userMessage}` }]
            }
          ]
        })
      })

      if (!response.ok) throw new Error()
      
      const data = await response.json()
      const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Unable to process query.'
      
      setChatHistory(prev => [...prev, { role: 'model', text: reply }])
      addLog(`Assistant reply compiled.`, 'success')
    } catch (err) {
      // Fallback chat reply
      setChatHistory(prev => [
        ...prev,
        { role: 'model', text: `[SIMULATED FEEDBACK] Direct satellite connection down. Recommend initiating standard safety protocols for disaster type: ${incident.type.toUpperCase()}.` }
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <aside className="hud-panel" style={{ gridColumn: '3', display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* HUD Header */}
      <div style={{ padding: '14px', borderBottom: '1px solid rgba(0, 210, 255, 0.15)', background: 'rgba(4, 8, 20, 0.4)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="hud-title" style={{ fontSize: '0.8rem', color: 'var(--color-blue)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Cpu style={{ width: '15px', height: '15px' }} />
          <span>AI TACTICAL ADVISER</span>
        </div>
        <span 
          style={{ 
            fontSize: '0.65rem', 
            fontFamily: 'var(--font-terminal)', 
            color: apiStatus === 'online' ? 'var(--color-green)' : 'var(--color-amber)',
            border: `1px solid ${apiStatus === 'online' ? 'var(--border-glow-green)' : 'var(--border-glow-amber)'}`,
            padding: '1px 6px',
            borderRadius: '2px'
          }}
        >
          {apiStatus.toUpperCase()}
        </span>
      </div>

      {/* Main panel scrollable area */}
      <div style={{ flex: '1', overflowY: 'auto', padding: '14px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        
        {/* Incident Profile Brief */}
        <div style={{ border: '1px solid rgba(0, 210, 255, 0.12)', background: 'rgba(8, 16, 40, 0.3)', padding: '10px', borderRadius: '4px' }}>
          <div style={{ fontSize: '0.65rem', fontFamily: 'var(--font-terminal)', color: 'var(--color-blue)', marginBottom: '4px' }}>
            ACTIVE INCIDENT TARGET PROFILE
          </div>
          <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#fff' }}>
            {incident.id} : {incident.name}
          </div>
          <div style={{ display: 'flex', gap: '10px', marginTop: '6px', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
            <span>TYPE: <strong style={{ color: 'var(--color-blue)' }}>{incident.type.toUpperCase()}</strong></span>
            <span>|</span>
            <span>SEV: <strong style={{ color: 'var(--color-red)' }}>{incident.severity.toUpperCase()}</strong></span>
          </div>
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerateStrategy}
          disabled={loading}
          className="hud-button btn-critical"
          style={{ width: '100%', justifyContent: 'center', fontWeight: 'bold', letterSpacing: '0.08em', padding: '12px' }}
        >
          {loading ? 'COMPUTING THREAT MODEL...' : 'GENERATE RESPONSE STRATEGY'}
        </button>

        {/* Strategy Output */}
        {strategy && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            
            {/* Export SitRep Button */}
            <button
              onClick={handleExportSitRep}
              className="hud-button btn-success"
              style={{ width: '100%', justifyContent: 'center', fontSize: '0.75rem', gap: '8px', padding: '10px' }}
            >
              <FileText style={{ width: '14px', height: '14px' }} />
              <span>Export Emergency SitRep (.TXT)</span>
            </button>
            
            {/* Risk Analysis */}
            <div style={{ borderLeft: '3px solid var(--color-red)', background: 'rgba(255, 59, 48, 0.03)', padding: '8px 10px' }}>
              <div style={{ fontSize: '0.65rem', fontFamily: 'var(--font-terminal)', color: 'var(--color-red)', fontWeight: 'bold', marginBottom: '2px' }}>
                THREAT PROFILE ANALYSIS
              </div>
              <p style={{ fontSize: '0.75rem', lineHeight: '1.4', color: 'var(--text-primary)' }}>
                {strategy.analysis}
              </p>
            </div>

            {/* Evacuation plan */}
            <div style={{ borderLeft: '3px solid var(--color-amber)', background: 'rgba(255, 159, 10, 0.03)', padding: '8px 10px' }}>
              <div style={{ fontSize: '0.65rem', fontFamily: 'var(--font-terminal)', color: 'var(--color-amber)', fontWeight: 'bold', marginBottom: '2px' }}>
                EVACUATION CORRIDOR
              </div>
              <p style={{ fontSize: '0.75rem', lineHeight: '1.4', color: 'var(--text-primary)' }}>
                {strategy.evacuation}
              </p>
            </div>

            {/* Recommended Resources */}
            <div style={{ borderLeft: '3px solid var(--color-blue)', background: 'rgba(0, 210, 255, 0.03)', padding: '8px 10px' }}>
              <div style={{ fontSize: '0.65rem', fontFamily: 'var(--font-terminal)', color: 'var(--color-blue)', fontWeight: 'bold', marginBottom: '4px' }}>
                RECOMMENDED DISPATCH CHECKLIST
              </div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {strategy.resources.map((res, idx) => {
                  const match = getMatchingResponder(res)
                  return (
                    <li key={idx} style={{ fontSize: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-primary)', background: 'rgba(255,255,255,0.01)', padding: '4px 6px', borderRadius: '3px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: '1', marginRight: '8px' }}>
                        <Check style={{ width: '12px', height: '12px', color: 'var(--color-blue)', flexShrink: 0 }} />
                        <span>{res}</span>
                      </div>
                      {match && (
                        <div style={{ flexShrink: 0 }}>
                          {match.status === 'standby' ? (
                            <button
                              onClick={() => onDeploy(match.id, incident.id)}
                              className="hud-button btn-success"
                              style={{ padding: '2px 6px', fontSize: '0.55rem', height: 'auto', textTransform: 'uppercase', fontFamily: 'var(--font-terminal)' }}
                            >
                              Dispatch
                            </button>
                          ) : match.targetIncident === incident.id ? (
                            <span 
                              className="glow-text-green" 
                              style={{ fontFamily: 'var(--font-terminal)', fontSize: '0.6rem', border: '1px solid rgba(0, 255, 102, 0.2)', padding: '1px 4px', borderRadius: '2px', textTransform: 'uppercase' }}
                            >
                              Active
                            </span>
                          ) : (
                            <span 
                              className="glow-text-amber" 
                              style={{ fontFamily: 'var(--font-terminal)', fontSize: '0.6rem', border: '1px solid rgba(255, 159, 10, 0.2)', padding: '1px 4px', borderRadius: '2px', textTransform: 'uppercase' }}
                              title={`Assigned to ${match.targetIncident}`}
                            >
                              Busy
                            </span>
                          )}
                        </div>
                      )}
                    </li>
                  )
                })}
              </ul>
            </div>

            {/* Warning Broadcast */}
            <div style={{ border: '1px dashed var(--color-red)', background: 'rgba(255, 59, 48, 0.05)', padding: '10px', borderRadius: '4px' }}>
              <div style={{ fontSize: '0.65rem', fontFamily: 'var(--font-terminal)', color: 'var(--color-red)', fontWeight: 'bold', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <AlertCircle style={{ width: '13px', height: '13px' }} />
                <span>OFFICIAL BROADCAST BULLETIN</span>
              </div>
              <p style={{ fontSize: '0.75rem', fontStyle: 'italic', lineHeight: '1.4', color: '#ffb3b3', background: 'rgba(0,0,0,0.2)', padding: '6px', borderRadius: '2px' }}>
                "{strategy.alert}"
              </p>
            </div>

          </div>
        )}

        {/* Chat / Dialogue Interface */}
        <div style={{ marginTop: '10px', borderTop: '1px solid rgba(0, 210, 255, 0.15)', paddingTop: '14px' }}>
          <div style={{ fontSize: '0.65rem', fontFamily: 'var(--font-terminal)', color: 'var(--color-blue)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <MessageSquare style={{ width: '13px', height: '13px' }} />
            <span>DIRECT COM-LINK TO TACTICAL AGENT</span>
          </div>

          {/* Chat history */}
          <div 
            style={{ 
              height: '140px', 
              overflowY: 'auto', 
              background: 'rgba(4, 8, 20, 0.8)', 
              border: '1px solid rgba(0, 210, 255, 0.15)', 
              borderRadius: '4px',
              padding: '8px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              marginBottom: '8px'
            }}
          >
            {chatHistory.map((msg, index) => (
              <div 
                key={index}
                style={{
                  alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '85%',
                  background: msg.role === 'user' ? 'rgba(0, 210, 255, 0.15)' : 'rgba(8, 16, 40, 0.7)',
                  border: `1px solid ${msg.role === 'user' ? 'rgba(0, 210, 255, 0.3)' : 'rgba(0, 255, 102, 0.1)'}`,
                  padding: '6px 10px',
                  borderRadius: '4px',
                  fontSize: '0.72rem',
                  lineHeight: '1.3'
                }}
              >
                {msg.text}
              </div>
            ))}
          </div>

          {/* Chat Input */}
          <form onSubmit={handleSendChat} style={{ display: 'flex', gap: '6px' }}>
            <input 
              type="text" 
              placeholder="ASK AGENT REGARDING EVAC, COORDINATES..." 
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              className="cyber-input"
              style={{ flex: '1', fontSize: '0.75rem' }}
            />
            <button 
              type="submit" 
              className="hud-button" 
              style={{ padding: '8px 12px' }}
            >
              <Send style={{ width: '13px', height: '13px' }} />
            </button>
          </form>
        </div>

      </div>
    </aside>
  )
}
