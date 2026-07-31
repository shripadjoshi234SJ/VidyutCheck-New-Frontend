import React from 'react';
import { ShieldCheck, Activity, History, FileText, Settings, LogIn, Zap, Upload } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: { loggedIn: boolean; username: string } | null;
  onAuthClick: () => void;
  onLogout: () => void;
  isBackendConnected: boolean;
}

const Navbar: React.FC<NavbarProps> = ({
  activeTab, setActiveTab, user, onAuthClick, onLogout, isBackendConnected,
}) => {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard',      icon: Activity    },
    { id: 'auditor',   label: 'Bill Auditor',    icon: ShieldCheck },
    { id: 'history',   label: 'Audit History',   icon: History     },
    { id: 'disputes',  label: 'Dispute Reports', icon: FileText    },
    { id: 'settings',  label: 'Settings',        icon: Settings    },
  ];

  return (
    <nav className="glass-panel" style={{
      margin: '1.25rem 1.25rem 0',
      padding: '0.85rem 1.5rem',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      position: 'sticky', top: '1.25rem', zIndex: 100, gap: '1rem',
    }}>
      {/* Brand */}
      <div style={{ display:'flex', alignItems:'center', gap:'0.7rem', cursor:'pointer', flexShrink:0 }}
        onClick={() => setActiveTab('dashboard')}>
        <div style={{
          background: 'linear-gradient(135deg, hsl(210,100%,55%) 0%, hsl(272,85%,60%) 100%)',
          width: '38px', height: '38px', borderRadius: '10px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 16px hsla(210,100%,55%,0.45)',
        }}>
          <Zap size={20} color="#fff" fill="#fff" />
        </div>
        <div>
          <h1 style={{
            fontSize: '1.25rem', fontWeight: 800,
            background: 'linear-gradient(to right, #fff, hsl(210,40%,80%))',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            lineHeight: 1.1, display: 'flex', alignItems: 'center', gap: '0.3rem',
          }}>
            Vidyutcheck
            <span style={{ fontSize:'0.6rem', fontWeight:700, color:'var(--electric-blue)', border:'1px solid hsla(210,100%,55%,0.3)', padding:'1px 5px', borderRadius:'4px', background:'var(--electric-blue-glow)', WebkitTextFillColor:'var(--electric-blue)', verticalAlign:'middle' }}>AI</span>
          </h1>
          <p style={{ fontSize:'0.62rem', color:'var(--text-muted)', letterSpacing:'0.08em', textTransform:'uppercase' }}>Smart Utility Auditor</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:'0.2rem', flex:1, justifyContent:'center' }}>
        {tabs.map(({ id, label, icon: Icon }) => {
          const active = activeTab === id;
          return (
            <button key={id} onClick={() => setActiveTab(id)} style={{
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              padding: '0.55rem 0.9rem',
              border: 'none', borderRadius: '8px',
              background: active ? 'var(--electric-blue-glow)' : 'transparent',
              color: active ? 'var(--electric-blue)' : 'var(--text-secondary)',
              fontWeight: 600, fontSize: '0.84rem', cursor: 'pointer',
              transition: 'var(--transition-smooth)',
              borderBottom: active ? '2px solid var(--electric-blue)' : '2px solid transparent',
              whiteSpace: 'nowrap',
            }}
              className={active ? 'pulse-glow' : ''}
              onMouseEnter={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-primary)'; }}
              onMouseLeave={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-secondary)'; }}
            >
              <Icon size={16} />
              <span>{label}</span>
            </button>
          );
        })}
      </div>

      {/* Right side */}
      <div style={{ display:'flex', alignItems:'center', gap:'1rem', flexShrink:0 }}>

        {/* Upload Bill quick button */}
        <button className="btn-upload" style={{ padding:'0.5rem 1rem', fontSize:'0.82rem', borderRadius:'8px' }}
          onClick={() => { localStorage.setItem('trigger_bill_upload','true'); setActiveTab('auditor'); }}>
          <Upload size={15} style={{ color:'var(--vivid-purple)' }} />
          <span>Upload Bill</span>
        </button>

        {/* Backend status */}
        <div style={{ display:'flex', alignItems:'center', gap:'0.4rem', fontSize:'0.76rem', color:'var(--text-muted)' }}>
          <div style={{
            width:'7px', height:'7px', borderRadius:'50%',
            background: isBackendConnected ? 'var(--neon-emerald)' : 'var(--coral-red)',
            boxShadow: isBackendConnected ? '0 0 8px var(--neon-emerald)' : '0 0 8px var(--coral-red)',
          }}></div>
          <span>{isBackendConnected ? 'API Live' : 'Offline'}</span>
        </div>

        {/* User account */}
        {user?.loggedIn ? (
          <div style={{ display:'flex', alignItems:'center', gap:'0.75rem' }}>
            <div style={{
              background: 'linear-gradient(135deg, var(--electric-blue) 0%, var(--vivid-purple) 100%)',
              width:'32px', height:'32px', borderRadius:'50%',
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:'0.78rem', fontWeight:800, color:'#fff',
              boxShadow:'0 0 10px hsla(210,100%,55%,0.3)',
            }}>
              {user.username.charAt(0).toUpperCase()}
            </div>
            <span style={{ fontWeight:600, fontSize:'0.85rem', color:'var(--text-primary)', maxWidth:'90px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
              {user.username}
            </span>
            <button onClick={onLogout} style={{
              background:'none', border:'none', color:'var(--text-muted)',
              fontSize:'0.78rem', cursor:'pointer', textDecoration:'underline',
              transition:'var(--transition-smooth)',
            }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--coral-red)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
            >Logout</button>
          </div>
        ) : (
          <button onClick={onAuthClick} className="btn-primary" style={{ padding:'0.48rem 1rem', fontSize:'0.83rem' }}>
            <LogIn size={15} /><span>Sign In</span>
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
