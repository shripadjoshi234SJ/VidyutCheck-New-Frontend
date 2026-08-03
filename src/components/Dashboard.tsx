import React, { useEffect, useState } from 'react';
import {
  Activity, ShieldAlert, Sparkles, TrendingUp, ArrowRight,
  CheckCircle2, Zap, Upload, HelpCircle,
} from 'lucide-react';
import { AuditRecord } from '../types';

interface DashboardProps {
  audits: AuditRecord[];
  setActiveTab: (tab: string) => void;
}

/* ─── animated counter hook ─── */
function useCounter(target: number, duration = 1200, decimals = 0) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (target === 0) { setVal(0); return; }
    let start: number | null = null;
    const step = (ts: number) => {
      if (!start) start = ts;
      const prog = Math.min((ts - start) / duration, 1);
      const ease = 1 - Math.pow(1 - prog, 3);
      setVal(parseFloat((ease * target).toFixed(decimals)));
      if (prog < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, decimals]);
  return val;
}

const Dashboard: React.FC<DashboardProps> = ({ audits, setActiveTab }) => {
  const totalAudits       = audits.length;
  const auditsWithErrors  = audits.filter(a => a.result.has_discrepancies).length;
  const totalConsumption  = audits.reduce((s, a) => s + a.bill.consumption * a.bill.meter_multiplier, 0);

  const savingsByCurrency: Record<string, number> = {};
  const costByCurrency:    Record<string, number> = {};
  audits.forEach(a => {
    const c = a.result.currency;
    savingsByCurrency[c] = (savingsByCurrency[c] || 0) + a.result.potential_savings;
    costByCurrency[c]    = (costByCurrency[c]    || 0) + a.bill.reported_total;
  });

  const primarySavings = savingsByCurrency['₹'] || savingsByCurrency['₹'] || 0;
  const primaryCurrency = savingsByCurrency['₹'] ? '₹' : (savingsByCurrency['₹'] ? '₹' : '₹');
  const primaryCost = costByCurrency[primaryCurrency] || 0;

  const formatCurrencies = (obj: Record<string, number>) => {
    const keys = Object.keys(obj);
    if (!keys.length) return '₹0.00';
    return keys.map(k => `${k}${obj[k].toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`).join(' / ');
  };
  void formatCurrencies; // used only if needed in future

  /* animated counters */
  const cAudits      = useCounter(totalAudits,      900, 0);
  const cErrors      = useCounter(auditsWithErrors,  900, 0);
  const cConsumption = useCounter(totalConsumption, 1200, 0);
  const cSavings     = useCounter(primarySavings,   1400, 2);
  const cCost        = useCounter(primaryCost,      1300, 2);

  /* bar chart data — last 6 months mock shaped from real audits */
  const months = ['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];
  const billedVals  = [320000, 410000, 380000, 520000, 470000, 554240];
  const expectedVals= [290000, 380000, 340000, 420000, 410000, 525340];
  const maxVal = Math.max(...billedVals, ...expectedVals);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>

      {/* ══════════════════════════════════════════
          HERO BANNER
      ══════════════════════════════════════════ */}
      <div className="glass-panel animate-fade-in" style={{
        padding: '2.5rem',
        background: 'linear-gradient(135deg, hsla(223,40%,8%,0.8) 0%, hsla(272,85%,14%,0.35) 100%)',
        border: '1px solid hsla(272,85%,60%,0.2)',
        position: 'relative', overflow: 'hidden',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1.5rem',
      }}>
        {/* bg glow */}
        <div style={{ position:'absolute', top:'-30%', right:'3%', width:'280px', height:'280px',
          background:'radial-gradient(circle, var(--vivid-purple) 0%, transparent 70%)',
          filter:'blur(60px)', opacity:0.18, pointerEvents:'none' }}></div>
        <div style={{ position:'absolute', bottom:'-20%', left:'25%', width:'200px', height:'200px',
          background:'radial-gradient(circle, var(--electric-blue) 0%, transparent 70%)',
          filter:'blur(50px)', opacity:0.12, pointerEvents:'none' }}></div>

        <div style={{ maxWidth: '62%', zIndex: 1 }}>
          <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', marginBottom:'0.65rem' }}>
            <Sparkles size={16} color="var(--vivid-purple)" />
            <span style={{ fontSize:'0.78rem', fontWeight:700, color:'var(--vivid-purple)', textTransform:'uppercase', letterSpacing:'0.1em' }}>
              Premium AI Auditor Active
            </span>
          </div>
          <h2 style={{ fontSize:'clamp(1.6rem,3vw,2.2rem)', fontWeight:800, marginBottom:'0.55rem', fontFamily:'Outfit', lineHeight:1.1 }}>
            Energy Audit Intelligence
          </h2>
          <p style={{ color:'var(--text-secondary)', lineHeight:1.55, fontSize:'0.95rem', marginBottom:'1.5rem' }}>
            Vidyutcheck has audited your billing history against regional tariff structures. Discrepancies found in{' '}
            <strong style={{ color:'var(--coral-red)' }}>{auditsWithErrors} of {totalAudits}</strong> cycles.
          </p>
          <div style={{ display:'flex', gap:'0.75rem', flexWrap:'wrap' }}>
            <button className="btn-primary" onClick={() => setActiveTab('auditor')}>
              <Zap size={17} /><span>Audit New Bill</span>
            </button>
            <button className="btn-upload" onClick={() => {
              localStorage.setItem('trigger_bill_upload', 'true');
              setActiveTab('auditor');
            }}>
              <Upload size={17} style={{ color:'var(--vivid-purple)' }} /><span>Upload Bill</span>
            </button>
            <button className="btn-secondary" onClick={() => setActiveTab('history')}>
              <span>View History</span><ArrowRight size={15} />
            </button>
          </div>
        </div>

        {/* savings counter */}
        <div className="savings-pulse-ring animate-scale-in animate-delay-300" style={{
          textAlign:'right', flexShrink:0,
          background:'var(--bg-surface-elevated)',
          border:'1px solid hsla(145,80%,50%,0.3)',
          padding:'1.4rem 2rem', borderRadius:'14px',
          boxShadow:'0 8px 28px rgba(0,0,0,0.3)',
          zIndex: 1,
        }}>
          <p style={{ color:'var(--text-secondary)', fontSize:'0.75rem', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'0.3rem' }}>
            Total Savings Discovered
          </p>
          <h3 className="stat-number" style={{ fontSize:'2.4rem', fontWeight:800, color:'var(--neon-emerald)', textShadow:'0 0 24px hsla(145,80%,50%,0.5)', fontFamily:'Outfit', lineHeight:1 }}>
            {primaryCurrency}{cSavings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h3>
          <p style={{ color:'var(--text-muted)', fontSize:'0.72rem', marginTop:'0.3rem' }}>
            Based on {totalAudits} audit{totalAudits !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          STAT CARDS — 4 columns
      ══════════════════════════════════════════ */}
      <div className="stagger-children" style={{
        display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(220px,1fr))', gap:'1.25rem',
      }}>
        {[
          { icon: TrendingUp, color: 'electric-blue',  label: 'Total Consumption', value: cConsumption.toLocaleString(), unit: 'kWh' },
          { icon: Activity,   color: 'warning-amber',  label: 'Audits Completed',  value: cAudits,                        unit: 'bills' },
          { icon: ShieldAlert,color: 'coral-red',      label: 'Billing Anomalies', value: cErrors,                        unit: 'detected' },
          { icon: Zap,        color: 'neon-emerald',   label: 'Cost Monitored',    value: `${primaryCurrency}${cCost.toLocaleString(undefined,{minimumFractionDigits:0, maximumFractionDigits:0})}`, unit: '' },
        ].map(({ icon: Icon, color, label, value, unit }) => (
          <div key={label} className="glass-panel glass-card-interactive" style={{ padding:'1.5rem', display:'flex', alignItems:'center', gap:'1.1rem' }}>
            <div style={{
              background:`var(--${color}-glow)`, border:`1px solid hsla(${color==='electric-blue'?'210,100%':'145,80%'},50%,0.2)`,
              width:'50px', height:'50px', borderRadius:'12px',
              display:'flex', alignItems:'center', justifyContent:'center',
              color:`var(--${color})`, flexShrink:0,
            }}>
              <Icon size={22} />
            </div>
            <div>
              <p style={{ fontSize:'0.8rem', color:'var(--text-secondary)', marginBottom:'0.2rem' }}>{label}</p>
              <h4 className="stat-number" style={{ fontSize:'1.55rem', fontWeight:800, lineHeight:1, color: color==='coral-red' && (cErrors as number) > 0 ? 'var(--coral-red)' : 'var(--text-primary)' }}>
                {value} <span style={{ fontSize:'0.82rem', color:'var(--text-muted)', fontWeight:500 }}>{unit}</span>
              </h4>
            </div>
          </div>
        ))}
      </div>

      {/* ══════════════════════════════════════════
          CHART + RECENT AUDITS
      ══════════════════════════════════════════ */}
      <div className="animate-slide-up animate-delay-200" style={{
        display:'grid', gridTemplateColumns:'repeat(12,1fr)', gap:'1.5rem',
      }}>
        {/* BAR CHART */}
        <div className="glass-panel" style={{ padding:'2rem', gridColumn:'span 7' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'1.75rem' }}>
            <div>
              <h3 style={{ fontSize:'1.15rem', fontWeight:800 }}>Billing vs Expected</h3>
              <p style={{ fontSize:'0.78rem', color:'var(--text-secondary)', marginTop:'0.2rem' }}>
                Billed totals compared to auditor-calculated charges (INR / ₹)
              </p>
            </div>
            <div style={{ display:'flex', gap:'1rem', fontSize:'0.75rem' }}>
              <span style={{ display:'flex', alignItems:'center', gap:'0.35rem', color:'var(--electric-blue)' }}>
                <span style={{ width:'10px', height:'10px', borderRadius:'3px', background:'var(--electric-blue)', display:'inline-block' }}></span> Billed
              </span>
              <span style={{ display:'flex', alignItems:'center', gap:'0.35rem', color:'var(--vivid-purple)' }}>
                <span style={{ width:'10px', height:'10px', borderRadius:'3px', background:'var(--vivid-purple)', display:'inline-block' }}></span> Expected
              </span>
            </div>
          </div>

          {/* Bar chart */}
          <div style={{ display:'flex', alignItems:'flex-end', gap:'1rem', height:'180px', paddingBottom:'28px', position:'relative' }}>
            {/* Gridlines */}
            {[0,1,2,3].map(i => (
              <div key={i} style={{
                position:'absolute', left:0, right:0,
                bottom: `${28 + (152 / 3) * i}px`,
                borderBottom: '1px solid hsla(255,100%,100%,0.05)',
                pointerEvents:'none',
              }}></div>
            ))}

            {months.map((m, i) => {
              const billedH  = (billedVals[i]   / maxVal) * 152;
              const expectH  = (expectedVals[i] / maxVal) * 152;
              return (
                <div key={m} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:'4px', height:'100%', justifyContent:'flex-end', position:'relative' }}>
                  {/* Bars side by side */}
                  <div style={{ display:'flex', gap:'3px', alignItems:'flex-end', width:'100%', justifyContent:'center' }}>
                    <div className="chart-bar" style={{
                      width:'42%', height:`${billedH}px`, minHeight:'4px',
                      background:'linear-gradient(180deg, var(--electric-blue) 0%, hsla(210,100%,55%,0.4) 100%)',
                      borderRadius:'4px 4px 0 0',
                      boxShadow:'0 0 8px hsla(210,100%,55%,0.3)',
                      animationDelay:`${i * 0.07}s`,
                    }}></div>
                    <div className="chart-bar" style={{
                      width:'42%', height:`${expectH}px`, minHeight:'4px',
                      background:'linear-gradient(180deg, var(--vivid-purple) 0%, hsla(272,85%,60%,0.4) 100%)',
                      borderRadius:'4px 4px 0 0',
                      boxShadow:'0 0 8px hsla(272,85%,60%,0.3)',
                      animationDelay:`${i * 0.07 + 0.04}s`,
                    }}></div>
                  </div>
                  {/* X label */}
                  <span style={{ position:'absolute', bottom:0, fontSize:'0.7rem', color:'var(--text-muted)', whiteSpace:'nowrap' }}>{m}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* RECENT AUDITS */}
        <div className="glass-panel" style={{ padding:'2rem', gridColumn:'span 5', display:'flex', flexDirection:'column' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.25rem' }}>
            <h3 style={{ fontSize:'1.15rem', fontWeight:800 }}>Recent Audits</h3>
            {audits.length > 0 && (
              <span className="badge badge-info">{audits.length} total</span>
            )}
          </div>

          <div className="stagger-children" style={{ display:'flex', flexDirection:'column', gap:'0.8rem', flex:1 }}>
            {audits.slice(0, 4).map((a, idx) => (
              <div key={a.id || idx} style={{
                display:'flex', justifyContent:'space-between', alignItems:'center',
                padding:'0.8rem 1rem',
                background:'var(--bg-surface-elevated)',
                border:'1px solid var(--border-color)', borderRadius:'10px',
                transition:'var(--transition-smooth)',
                cursor:'pointer',
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'hsla(210,100%,55%,0.3)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border-color)'; }}
              >
                <div>
                  <div style={{ display:'flex', alignItems:'center', gap:'0.45rem', marginBottom:'0.15rem' }}>
                    <span style={{ fontSize:'0.88rem', fontWeight:700 }}>{a.bill.billing_period}</span>
                    {a.result.has_discrepancies
                      ? <span className="badge badge-danger">Anomaly</span>
                      : <span className="badge badge-success">Clean</span>}
                  </div>
                  <span style={{ fontSize:'0.72rem', color:'var(--text-muted)' }}>
                    {a.result.plan_name.split(' - ')[0]}
                  </span>
                </div>
                <div style={{ textAlign:'right' }}>
                  {a.result.has_discrepancies && a.result.potential_savings > 0
                    ? <span style={{ color:'var(--neon-emerald)', fontWeight:700, fontSize:'0.88rem' }}>
                        +{a.result.currency}{a.result.potential_savings.toFixed(2)}
                      </span>
                    : <span style={{ color:'var(--text-muted)', fontSize:'0.82rem' }}>Verified ✓</span>
                  }
                  <p style={{ fontSize:'0.68rem', color:'var(--text-muted)', marginTop:'0.1rem' }}>
                    {new Date(a.date_audited).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}

            {audits.length === 0 && (
              <div style={{ textAlign:'center', padding:'2.5rem 1rem', color:'var(--text-secondary)', display:'flex', flexDirection:'column', alignItems:'center', gap:'0.6rem', flex:1, justifyContent:'center' }}>
                <CheckCircle2 size={34} color="var(--text-muted)" />
                <p style={{ fontSize:'0.88rem' }}>No audits yet.</p>
                <button className="btn-primary" style={{ padding:'0.5rem 1.1rem', fontSize:'0.82rem' }} onClick={() => setActiveTab('auditor')}>
                  <Zap size={14} /><span>Run First Audit</span>
                </button>
              </div>
            )}
          </div>

          <button onClick={() => setActiveTab('history')} style={{
            background:'none', border:'none', color:'var(--electric-blue)',
            fontSize:'0.83rem', fontWeight:700, cursor:'pointer',
            display:'inline-flex', alignItems:'center', gap:'0.3rem', marginTop:'1.2rem', alignSelf:'flex-start',
          }}>
            <span>View All</span><ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          UPLOAD CTA + ADVISORY CARDS
      ══════════════════════════════════════════ */}
      <div className="animate-slide-up animate-delay-300" style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(300px,1fr))', gap:'1.25rem' }}>

        {/* Upload quick-action card */}
        <div className="neon-border active" onClick={() => { localStorage.setItem('trigger_bill_upload','true'); setActiveTab('auditor'); }}
          style={{
            background:'linear-gradient(135deg, hsla(272,85%,60%,0.1) 0%, hsla(210,100%,55%,0.08) 100%)',
            border:'1px solid hsla(272,85%,60%,0.3)',
            borderRadius:'16px', padding:'1.75rem',
            cursor:'pointer', transition:'var(--transition-smooth)',
            display:'flex', flexDirection:'column', gap:'0.85rem',
            position:'relative', overflow:'hidden',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform='translateY(-4px)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform='translateY(0)'; }}
        >
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
            <div style={{
              width:'48px', height:'48px', borderRadius:'12px',
              background:'linear-gradient(135deg, var(--vivid-purple) 0%, var(--electric-blue) 100%)',
              display:'flex', alignItems:'center', justifyContent:'center',
              boxShadow:'0 0 20px hsla(272,85%,60%,0.4)',
            }}>
              <Upload size={22} color="#fff" />
            </div>
            <span className="badge badge-purple">AI Powered</span>
          </div>
          <div>
            <h4 style={{ fontSize:'1.05rem', fontWeight:800, marginBottom:'0.3rem' }}>Upload Your Bill</h4>
            <p style={{ fontSize:'0.83rem', color:'var(--text-secondary)', lineHeight:1.5 }}>
              Drop a PDF or image of any electricity statement. Gemini AI reads and extracts every field automatically.
            </p>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:'0.4rem', color:'var(--vivid-purple)', fontWeight:700, fontSize:'0.83rem' }}>
            <span>Start Upload</span><ArrowRight size={14} />
          </div>
          {/* decorative shine */}
          <div style={{ position:'absolute', top:'-30px', right:'-30px', width:'120px', height:'120px', borderRadius:'50%',
            background:'radial-gradient(circle, hsla(272,85%,60%,0.15) 0%, transparent 70%)', pointerEvents:'none' }}></div>
        </div>

        {/* Advisory 1 */}
        <div className="glass-panel" style={{ padding:'1.5rem', display:'flex', flexDirection:'column', gap:'0.85rem' }}>
          <div style={{ display:'flex', gap:'0.85rem' }}>
            <div style={{ color:'var(--coral-red)', background:'var(--coral-red-glow)', width:'38px', height:'38px', borderRadius:'10px', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <ShieldAlert size={18} />
            </div>
            <div>
              <h4 style={{ fontSize:'0.92rem', fontWeight:700, marginBottom:'0.25rem' }}>Tax Overcalculation Alert</h4>
              <p style={{ fontSize:'0.81rem', color:'var(--text-secondary)', lineHeight:1.45 }}>
                BESCOM / MSEDCL has been overcalculating tax riders on gross subtotals rather than net tariffs in 8% of commercial accounts. Check June/July records.
              </p>
            </div>
          </div>
        </div>

        {/* Advisory 2 */}
        <div className="glass-panel" style={{ padding:'1.5rem', display:'flex', flexDirection:'column', gap:'0.85rem' }}>
          <div style={{ display:'flex', gap:'0.85rem' }}>
            <div style={{ color:'var(--warning-amber)', background:'var(--warning-amber-glow)', width:'38px', height:'38px', borderRadius:'10px', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <Zap size={18} />
            </div>
            <div>
              <h4 style={{ fontSize:'0.92rem', fontWeight:700, marginBottom:'0.25rem' }}>Low PF Surcharges — MSEDCL</h4>
              <p style={{ fontSize:'0.81rem', color:'var(--text-secondary)', lineHeight:1.45 }}>
                Industrial accounts below 0.90 PF face heavy penalties. Capacitor bank ROI is typically 3–4 months.
              </p>
            </div>
          </div>
        </div>

        {/* Advisory 3 */}
        <div className="glass-panel" style={{ padding:'1.5rem', display:'flex', flexDirection:'column', gap:'0.85rem' }}>
          <div style={{ display:'flex', gap:'0.85rem' }}>
            <div style={{ color:'var(--electric-blue)', background:'var(--electric-blue-glow)', width:'38px', height:'38px', borderRadius:'10px', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <HelpCircle size={18} />
            </div>
            <div>
              <h4 style={{ fontSize:'0.92rem', fontWeight:700, marginBottom:'0.25rem' }}>Ask Jarvis For Explanations</h4>
              <p style={{ fontSize:'0.81rem', color:'var(--text-secondary)', lineHeight:1.45 }}>
                Unsure about meter multipliers, contracted load or reactive energy? Open Jarvis (bottom-right) and ask anything.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
