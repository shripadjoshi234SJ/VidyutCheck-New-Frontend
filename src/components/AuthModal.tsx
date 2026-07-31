import React, { useState, useEffect } from 'react';
import { X, LogIn, UserPlus, KeyRound, Mail, Zap, ArrowRight, Shield, BarChart3, FileSearch } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (username: string) => void;
  isFullScreen?: boolean;
}

const FEATURES = [
  { icon: FileSearch, label: 'AI Bill OCR',    desc: 'Upload any bill — Gemini reads every number instantly' },
  { icon: Shield,     label: 'Tariff Audit',   desc: 'Checks every line against official utility rate schedules' },
  { icon: BarChart3,  label: 'Savings Reports',desc: 'Auto-generates formal dispute letters for overbilling' },
];

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLoginSuccess, isFullScreen = false }) => {
  const [isLogin, setIsLogin]         = useState(true);
  const [email, setEmail]             = useState('');
  const [password, setPassword]       = useState('');
  const [name, setName]               = useState('');
  const [isLoading, setIsLoading]     = useState(false);
  const [errorMsg, setErrorMsg]       = useState('');
  const [mounted, setMounted]         = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  void mounted;

  useEffect(() => { const t = setTimeout(() => setMounted(true), 80); return () => clearTimeout(t); }, []);

  if (!isOpen && !isFullScreen) return null;

  const switchTab = (login: boolean) => { setIsLogin(login); setErrorMsg(''); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true); setErrorMsg('');
    setTimeout(() => {
      setIsLoading(false);
      if (!email || !password) { setErrorMsg('Please fill in all fields.'); return; }
      onLoginSuccess(name || email.split('@')[0]);
      if (!isFullScreen) onClose();
    }, 1400);
  };

  /* ─── shared form card ─── */
  const formCard = (
    <div className="animate-scale-in" style={{
      width: '100%', maxWidth: '420px', position: 'relative', zIndex: 3,
      background: 'var(--bg-surface)',
      backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
      border: '1px solid hsla(210,100%,55%,0.18)',
      borderRadius: '20px', padding: '2.5rem',
      boxShadow: '0 24px 64px rgba(0,0,0,0.55), 0 0 32px hsla(210,100%,55%,0.1)',
    }}>
      {!isFullScreen && (
        <button onClick={onClose} style={{
          position: 'absolute', top: '1rem', right: '1rem',
          background: 'hsla(223,30%,18%,0.7)', border: '1px solid var(--border-color)',
          color: 'var(--text-secondary)', cursor: 'pointer',
          width: '28px', height: '28px', borderRadius: '8px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'var(--transition-smooth)',
        }}
          onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-secondary)')}
        ><X size={14} /></button>
      )}

      {/* Logo row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.75rem' }}>
        <div style={{
          width: '42px', height: '42px', borderRadius: '11px', flexShrink: 0,
          background: 'linear-gradient(135deg, var(--electric-blue) 0%, var(--vivid-purple) 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 20px hsla(210,100%,55%,0.4)',
        }}><Zap size={22} color="#fff" fill="#fff" /></div>
        <div>
          <span style={{ fontSize: '1.2rem', fontWeight: 800, fontFamily: 'Outfit', background: 'linear-gradient(to right,#fff,hsl(210,40%,80%))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Vidyutcheck</span>
          <span style={{ fontSize: '0.62rem', fontWeight: 700, color: 'var(--electric-blue)', border: '1px solid hsla(210,100%,55%,0.3)', background: 'var(--electric-blue-glow)', padding: '1px 5px', borderRadius: '4px', marginLeft: '6px', verticalAlign: 'middle' }}>AI</span>
          <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '1px' }}>Smart Utility Auditor</p>
        </div>
      </div>

      <h3 style={{ fontSize: '1.55rem', fontWeight: 800, marginBottom: '0.3rem' }}>
        {isLogin ? 'Welcome back' : 'Create account'}
      </h3>
      <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.75rem' }}>
        {isLogin ? 'Sign in to access your audit dashboard.' : 'Start auditing your energy bills for free.'}
      </p>

      {/* Toggle tabs */}
      <div style={{
        display: 'flex', background: 'hsla(223,40%,10%,0.7)',
        padding: '3px', borderRadius: '10px', marginBottom: '1.5rem',
        border: '1px solid var(--border-color)',
      }}>
        {[{ label: 'Sign In', active: isLogin }, { label: 'Register', active: !isLogin }].map(({ label, active }, i) => (
          <button key={label} onClick={() => switchTab(i === 0)} style={{
            flex: 1, padding: '0.52rem', border: 'none', borderRadius: '8px',
            cursor: 'pointer', fontWeight: 700, fontSize: '0.875rem',
            background: active ? 'linear-gradient(135deg, var(--electric-blue) 0%, var(--vivid-purple) 100%)' : 'transparent',
            color: active ? '#fff' : 'var(--text-secondary)',
            transition: 'var(--transition-smooth)',
            boxShadow: active ? '0 2px 12px hsla(210,100%,55%,0.3)' : 'none',
          }}>{label}</button>
        ))}
      </div>

      {errorMsg && (
        <div style={{
          background: 'var(--coral-red-glow)', border: '1px solid var(--coral-red)',
          color: 'var(--coral-red)', padding: '0.65rem 1rem', borderRadius: '9px',
          fontSize: '0.85rem', marginBottom: '1rem',
          display: 'flex', alignItems: 'center', gap: '0.5rem',
        }}>⚠ {errorMsg}</div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {!isLogin && (
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Full Name</label>
            <input type="text" placeholder="Tony Stark" value={name} onChange={e => setName(e.target.value)} className="form-input" required />
          </div>
        )}
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label">Email Address</label>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none', display:'flex' }}><Mail size={15} /></span>
            <input type="email" placeholder="stark@industries.com" value={email} onChange={e => setEmail(e.target.value)} className="form-input" style={{ paddingLeft: '2.4rem' }} required />
          </div>
        </div>
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label">Password</label>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none', display:'flex' }}><KeyRound size={15} /></span>
            <input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} className="form-input" style={{ paddingLeft: '2.4rem' }} required />
          </div>
        </div>

        <button type="submit" className="btn-primary"
          style={{ justifyContent: 'center', padding: '0.9rem', fontSize: '0.95rem', marginTop: '0.35rem', borderRadius: '10px' }}
          disabled={isLoading}
        >
          {isLoading
            ? <><span className="spinner-sm"></span><span>Authenticating…</span></>
            : isLogin
              ? <><LogIn size={17} /><span>Sign In</span><ArrowRight size={14} /></>
              : <><UserPlus size={17} /><span>Create Account</span></>}
        </button>
      </form>

      <p style={{ textAlign: 'center', marginTop: '1.2rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
        {isLogin ? "Don't have an account? " : 'Already have one? '}
        <button onClick={() => switchTab(!isLogin)} style={{ background: 'none', border: 'none', color: 'var(--electric-blue)', cursor: 'pointer', fontWeight: 700, fontSize: '0.78rem' }}>
          {isLogin ? 'Sign up free' : 'Sign in'}
        </button>
      </p>

      {/* Subtle animated bottom glow */}
      <div style={{ position: 'absolute', bottom: 0, left: '20%', right: '20%', height: '1px', background: 'linear-gradient(90deg, transparent, var(--electric-blue), var(--vivid-purple), transparent)', opacity: 0.6 }}></div>
    </div>
  );

  /* ─── full-screen split layout ─── */
  if (isFullScreen) {
    return (
      <div style={{ minHeight: '100vh', width: '100vw', display: 'flex', overflow: 'hidden', position: 'relative' }}>

        {/* LEFT panel — brand + features */}
        <div style={{
          flex: '0 0 48%', display: 'flex', flexDirection: 'column',
          justifyContent: 'center', alignItems: 'flex-start',
          padding: 'clamp(2rem,5vw,5rem)', position: 'relative', overflow: 'hidden',
          background: 'linear-gradient(150deg, hsla(222,47%,5%,1) 0%, hsla(240,35%,8%,1) 100%)',
          borderRight: '1px solid var(--border-color)',
        }}>
          {/* animated mesh + orbs */}
          <div style={{ position: 'absolute', inset: 0, zIndex: 0, overflow: 'hidden' }}>
            <div className="mesh-grid" style={{ position:'absolute', inset:0 }}></div>
            <div className="mesh-orb-1"></div>
            <div className="mesh-orb-2" style={{ opacity: 0.55 }}></div>
          </div>

          {/* floating particles */}
          {[1,2,3,4,5,6,7,8].map(n => <div key={n} className={`particle particle-${n}`}></div>)}

          <div style={{ position: 'relative', zIndex: 2, maxWidth: '460px' }}>
            {/* Bolt icon */}
            <div className="animate-scale-in" style={{
              width: '68px', height: '68px', borderRadius: '18px', marginBottom: '1.75rem',
              background: 'linear-gradient(135deg, var(--electric-blue) 0%, var(--vivid-purple) 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 35px hsla(210,100%,55%,0.55), 0 0 70px hsla(272,85%,60%,0.25)',
            }}><Zap size={34} color="#fff" fill="#fff" /></div>

            <h1 className="animate-fade-in animate-delay-100" style={{
              fontSize: 'clamp(2rem,3.5vw,3.2rem)', fontWeight: 800,
              lineHeight: 1.08, marginBottom: '0.75rem', letterSpacing: '-0.03em',
            }}>
              <span style={{ background: 'linear-gradient(135deg,#fff 30%,hsl(210,60%,85%) 100%)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>Stop Overpaying</span><br />
              <span style={{ color: 'var(--vivid-purple)' }}>Your Energy Bills.</span>
            </h1>

            <p className="animate-fade-in animate-delay-200" style={{
              fontSize: '1.02rem', color: 'var(--text-secondary)',
              lineHeight: 1.65, marginBottom: '2.5rem',
            }}>
              Vidyutcheck AI audits every line of your electricity statement against official tariff rates — and catches errors your utility company hopes you'll miss.
            </p>

            {/* Feature list */}
            <div className="stagger-children" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {FEATURES.map(({ icon: Icon, label, desc }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{
                    width: '42px', height: '42px', borderRadius: '11px', flexShrink: 0,
                    background: 'var(--electric-blue-glow)', border: '1px solid hsla(210,100%,55%,0.22)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--electric-blue)',
                  }}><Icon size={18} /></div>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: '0.92rem', marginBottom: '0.1rem' }}>{label}</p>
                    <p style={{ fontSize: '0.79rem', color: 'var(--text-muted)' }}>{desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Live badge */}
            <div className="animate-fade-in animate-delay-500" style={{
              marginTop: '2.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.55rem',
              background: 'hsla(145,80%,50%,0.08)', border: '1px solid hsla(145,80%,50%,0.25)',
              padding: '0.45rem 1rem', borderRadius: '20px',
            }}>
              <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--neon-emerald)', boxShadow: '0 0 8px var(--neon-emerald)', animation: 'savingsPulse 2s infinite' }}></div>
              <span style={{ fontSize: '0.77rem', color: 'var(--neon-emerald)', fontWeight: 600 }}>No real account needed — demo freely</span>
            </div>
          </div>
        </div>

        {/* RIGHT panel — form */}
        <div style={{
          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '2rem', position: 'relative', overflow: 'hidden',
          background: 'var(--bg-base)',
        }}>
          {/* subtle right-side orb */}
          <div style={{ position:'absolute', bottom:'-15%', right:'-10%', width:'50vw', height:'50vw', borderRadius:'50%',
            background:'radial-gradient(circle, hsla(272,85%,60%,0.06) 0%, transparent 70%)', filter:'blur(80px)', pointerEvents:'none' }}></div>
          <div style={{ position:'absolute', top:'-10%', left:'-5%', width:'35vw', height:'35vw', borderRadius:'50%',
            background:'radial-gradient(circle, hsla(210,100%,55%,0.05) 0%, transparent 70%)', filter:'blur(60px)', pointerEvents:'none' }}></div>
          {formCard}
        </div>
      </div>
    );
  }

  /* ─── modal overlay mode ─── */
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(4,7,15,0.82)', backdropFilter: 'blur(10px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {formCard}
    </div>
  );
};

export default AuthModal;
