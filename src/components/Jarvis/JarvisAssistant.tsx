import React, { useState, useRef, useEffect } from 'react';
import { Send, Minimize2, Trash2, Mic, Bot } from 'lucide-react';
import JarvisAvatar from './JarvisAvatar';
import { ChatMessage, UserSettings, AuditRecord } from '../../types';

interface JarvisAssistantProps {
  settings: UserSettings;
  activeAudit: AuditRecord | null;
}

const JarvisAssistant: React.FC<JarvisAssistantProps> = ({ settings, activeAudit }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('vidyutcheck_chat');
    return saved ? JSON.parse(saved) : [
      {
        role: 'model',
        parts: 'Greetings, Sir. I am Jarvis, your utility audit consultant. I have synced with your active dashboard parameters. How can I assist you today?'
      }
    ];
  });
  
  const [inputText, setInputText] = useState<string>('');
  const [jarvisState, setJarvisState] = useState<'idle' | 'listening' | 'processing' | 'speaking'>('idle');
  
  const messageEndRef = useRef<HTMLDivElement | null>(null);

  // Sync chat logs to localStorage
  useEffect(() => {
    localStorage.setItem('vidyutcheck_chat', JSON.stringify(messages));
  }, [messages]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMsg = inputText.trim();
    setInputText('');
    
    // Add user message
    const updatedHistory = [...messages, { role: 'user' as const, parts: userMsg }];
    setMessages(updatedHistory);
    
    // Animate to processing
    setJarvisState('processing');

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          history: updatedHistory.slice(0, -1), // Send previous history
          message: userMsg,
          bill_context: activeAudit ? {
            billing_period: activeAudit.bill.billing_period,
            provider_id: activeAudit.bill.provider_id,
            consumption_kwh: activeAudit.bill.consumption * activeAudit.bill.meter_multiplier,
            peak_demand: activeAudit.bill.peak_demand,
            power_factor: activeAudit.bill.power_factor,
            potential_savings: activeAudit.result.potential_savings,
            errors_detected: activeAudit.result.errors.map(e => e.message)
          } : null,
          api_key_override: settings.gemini_api_key,
          groq_api_key_override: settings.groq_api_key
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        // Speaking effect state
        setJarvisState('speaking');
        setMessages(prev => [...prev, { role: 'model', parts: data.response }]);
        
        // Revert to idle after delay
        setTimeout(() => {
          setJarvisState('idle');
        }, 3000);
      } else {
        throw new Error('Backend failed');
      }
    } catch (e) {
      setJarvisState('speaking');
      setMessages(prev => [
        ...prev, 
        { 
          role: 'model', 
          parts: 'Sir, I failed to establish a direct uplink with the Google AI Studio servers. Please confirm that the FastAPI backend is running locally at port 8000 and verify your API credentials in the **Settings** panel.' 
        }
      ]);
      setTimeout(() => {
        setJarvisState('idle');
      }, 3000);
    }
  };

  const handleClear = () => {
    const defaultMsg = [
      {
        role: 'model' as const,
        parts: 'System purged, Sir. Ready for new utility queries.'
      }
    ];
    setMessages(defaultMsg);
    localStorage.setItem('vidyutcheck_chat', JSON.stringify(defaultMsg));
  };

  const startVoiceSim = () => {
    setJarvisState('listening');
    // Pre-seed a voice prompt after 3s simulation
    setTimeout(() => {
      if (jarvisState === 'listening' || true) {
        setInputText("Explain how to fix my low power factor and what capacitor bank size is recommended.");
        setJarvisState('idle');
      }
    }, 2500);
  };

  return (
    <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 500 }}>
      {/* Minimized Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
            outline: 'none',
            filter: 'drop-shadow(0 4px 20px rgba(0,0,0,0.5))',
            position: 'relative',
          }}
          className="pulse-glow"
        >
          {/* Circular border ring */}
          <div style={{
            position: 'absolute',
            top: '-5px', left: '-5px', right: '-5px', bottom: '-5px',
            border: '1.5px solid var(--electric-blue)',
            borderRadius: '50%',
            opacity: 0.4,
            animation: 'spin 12s linear infinite',
          }}></div>
          
          <div style={{
            background: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-color)',
            borderRadius: '50%',
            width: '74px',
            height: '74px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 25px var(--electric-blue-glow)',
          }}>
            <JarvisAvatar state={jarvisState} size={70} />
          </div>
        </button>
      )}

      {/* Expanded Chat Assistant Panel */}
      {isOpen && (
        <div
          className="glass-panel"
          style={{
            width: '380px',
            height: '520px',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.5), 0 0 20px var(--electric-blue-glow)',
            animation: 'fadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
            overflow: 'hidden',
          }}
        >
          {/* Chat Header */}
          <div
            style={{
              padding: '1rem 1.25rem',
              background: 'var(--bg-surface-elevated)',
              borderBottom: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'var(--bg-base)' }}>
                <JarvisAvatar state={jarvisState} size={40} />
              </div>
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  Jarvis <span style={{ fontSize: '0.7rem', color: 'var(--electric-blue)', fontWeight: 500 }}>v1.4</span>
                </h4>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                  {jarvisState === 'idle' && 'Online'}
                  {jarvisState === 'listening' && 'Listening...'}
                  {jarvisState === 'processing' && 'Auditing database...'}
                  {jarvisState === 'speaking' && 'Speaking...'}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={handleClear}
                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '0.25rem' }}
                title="Purge Memory"
              >
                <Trash2 size={16} />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '0.25rem' }}
              >
                <Minimize2 size={16} />
              </button>
            </div>
          </div>

          {/* Chat log body */}
          <div
            style={{
              flex: 1,
              padding: '1.25rem',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              background: 'rgba(5, 8, 16, 0.3)',
            }}
          >
            {messages.map((msg, idx) => {
              const isModel = msg.role === 'model';
              return (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignSelf: isModel ? 'flex-start' : 'flex-end',
                    maxWidth: '85%',
                  }}
                >
                  <span style={{
                    fontSize: '0.65rem',
                    color: 'var(--text-muted)',
                    alignSelf: isModel ? 'flex-start' : 'flex-end',
                    marginBottom: '0.25rem',
                    padding: '0 0.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                  }}>
                    {isModel ? <Bot size={10} /> : null}
                    {isModel ? 'JARVIS' : 'USER'}
                  </span>
                  <div
                    style={{
                      padding: '0.75rem 1rem',
                      borderRadius: isModel ? '0 12px 12px 12px' : '12px 12px 0 12px',
                      backgroundColor: isModel ? 'var(--bg-surface-elevated)' : 'var(--electric-blue-glow)',
                      border: isModel ? '1px solid var(--border-color)' : '1px solid hsla(210, 100%, 55%, 0.3)',
                      color: 'var(--text-primary)',
                      fontSize: '0.85rem',
                      lineHeight: 1.4,
                      whiteSpace: 'pre-wrap',
                    }}
                  >
                    {msg.parts}
                  </div>
                </div>
              );
            })}
            <div ref={messageEndRef} />
          </div>

          {/* Chat input box */}
          <form
            onSubmit={handleSend}
            style={{
              padding: '0.85rem 1.25rem',
              background: 'var(--bg-surface-elevated)',
              borderTop: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <button
              type="button"
              onClick={startVoiceSim}
              style={{
                background: jarvisState === 'listening' ? 'var(--coral-red)' : 'hsla(223, 20%, 20%, 0.5)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                width: '38px',
                height: '38px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: jarvisState === 'listening' ? '#fff' : 'var(--text-secondary)',
                cursor: 'pointer',
                transition: 'var(--transition-smooth)',
              }}
              title="Voice Simulator"
            >
              <Mic size={16} className={jarvisState === 'listening' ? 'pulse-glow' : ''} />
            </button>
            <input
              type="text"
              placeholder="Ask Jarvis about billing errors..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              style={{
                flex: 1,
                background: 'var(--bg-base)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '0.6rem 0.85rem',
                color: 'var(--text-primary)',
                fontSize: '0.85rem',
                outline: 'none',
              }}
              onFocus={() => { if (jarvisState === 'idle') setJarvisState('listening'); }}
              onBlur={() => { if (jarvisState === 'listening') setJarvisState('idle'); }}
            />
            <button
              type="submit"
              style={{
                background: 'linear-gradient(135deg, var(--electric-blue) 0%, var(--vivid-purple) 100%)',
                border: 'none',
                borderRadius: '8px',
                width: '38px',
                height: '38px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(37, 99, 235, 0.3)',
              }}
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
      
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default JarvisAssistant;
