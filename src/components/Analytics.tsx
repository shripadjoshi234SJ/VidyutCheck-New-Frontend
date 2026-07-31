import React, { useState } from 'react';
import { Leaf, Sun, Info } from 'lucide-react';

const Analytics: React.FC = () => {
  // Solar Calculator State
  const [avgBill, setAvgBill] = useState<number>(350);
  const [solarSize, setSolarSize] = useState<number>(8); // kW
  const [installCost, setInstallCost] = useState<number>(14500); // USD
  const [taxCredit, setTaxCredit] = useState<boolean>(true); // 30% FTC in US

  // Payback calculation
  const netInstallCost = taxCredit ? installCost * 0.70 : installCost;
  // Estimate: 1kW solar produces ~125 kWh per month
  const monthlyProduction = solarSize * 125;
  const energyRate = 0.24; // Average rate
  const monthlySavings = monthlyProduction * energyRate;
  const paybackYears = netInstallCost / (monthlySavings * 12);
  const lifetimeSavings = (monthlySavings * 12 * 25) - netInstallCost; // 25 year solar lifespan

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.25rem', fontFamily: 'Outfit' }}>Energy Optimization & Analytics</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Evaluate carbon offsets, simulated energy sinks, and solar ROI matrices.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '1.5rem' }}>
        {/* Left Side: Carbon & Sinks (Span 6) */}
        <div style={{ gridColumn: 'span 6', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Carbon Footprint Card */}
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div style={{ color: 'var(--neon-emerald)', background: 'var(--neon-emerald-glow)', width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Leaf size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Sustainability Profile</h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Estimated greenhouse gas offsets based on audits</p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
              <div style={{ padding: '1rem', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Grid Carbon Intensity</p>
                <h4 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>0.85 lbs <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>CO2/kWh</span></h4>
              </div>
              <div style={{ padding: '1rem', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Equivalent Trees Planted</p>
                <h4 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--neon-emerald)' }}>35.2 <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>trees/year</span></h4>
              </div>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              By utilizing our auditor recommendations (such as correcting power factor or reducing peak demand HVAC schedules), you directly lower active power transmission losses. This reduces thermal power grid dispatching.
            </p>
          </div>

          {/* Energy Sinks Appliance Breakdown */}
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1.25rem' }}>Simulated Load Sinks</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* HVAC */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                  <span style={{ fontWeight: 500 }}>HVAC & Thermal Systems</span>
                  <span style={{ color: 'var(--electric-blue)', fontWeight: 600 }}>45%</span>
                </div>
                <div style={{ height: '8px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: '45%', height: '100%', background: 'linear-gradient(to right, var(--electric-blue), var(--vivid-purple))', borderRadius: '4px' }}></div>
                </div>
              </div>

              {/* Machinery / Motors */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                  <span style={{ fontWeight: 500 }}>Inductive Machinery / Pump Motors</span>
                  <span style={{ color: 'var(--vivid-purple)', fontWeight: 600 }}>25%</span>
                </div>
                <div style={{ height: '8px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: '25%', height: '100%', background: 'var(--vivid-purple)', borderRadius: '4px' }}></div>
                </div>
              </div>

              {/* Lighting */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                  <span style={{ fontWeight: 500 }}>Smart Lighting & Office Fixtures</span>
                  <span style={{ color: 'var(--warning-amber)', fontWeight: 600 }}>15%</span>
                </div>
                <div style={{ height: '8px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: '15%', height: '100%', background: 'var(--warning-amber)', borderRadius: '4px' }}></div>
                </div>
              </div>

              {/* Server racks / computing */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                  <span style={{ fontWeight: 500 }}>Data Racks & Compute Hardware</span>
                  <span style={{ color: 'var(--neon-emerald)', fontWeight: 600 }}>15%</span>
                </div>
                <div style={{ height: '8px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: '15%', height: '100%', background: 'var(--neon-emerald)', borderRadius: '4px' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Solar ROI Simulator (Span 6) */}
        <div className="glass-panel" style={{ padding: '2rem', gridColumn: 'span 6', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
            <div style={{ color: 'var(--warning-amber)', background: 'var(--warning-amber-glow)', width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sun size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Solar Photovoltaic ROI Model</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Simulate savings by installing solar systems on-site</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Average Monthly Bill Cost</span>
                <span>${avgBill}</span>
              </label>
              <input
                type="range"
                min="50"
                max="2000"
                step="25"
                value={avgBill}
                onChange={(e) => setAvgBill(parseInt(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--electric-blue)' }}
              />
            </div>

            <div className="form-row">
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">System Size (kW)</label>
                <input
                  type="number"
                  min="2"
                  max="100"
                  value={solarSize}
                  onChange={(e) => setSolarSize(Math.max(2, parseFloat(e.target.value) || 0))}
                  className="form-input"
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Gross Install Cost ($)</label>
                <input
                  type="number"
                  min="2000"
                  max="200000"
                  value={installCost}
                  onChange={(e) => setInstallCost(Math.max(1000, parseFloat(e.target.value) || 0))}
                  className="form-input"
                />
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="checkbox"
                id="taxCredit"
                checked={taxCredit}
                onChange={(e) => setTaxCredit(e.target.checked)}
                style={{ width: '16px', height: '16px', accentColor: 'var(--electric-blue)' }}
              />
              <label htmlFor="taxCredit" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                Apply Federal Investment Tax Credit (30% discount)
              </label>
            </div>

            {/* Calculations outputs */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '1rem',
              backgroundColor: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-color)',
              padding: '1.25rem',
              borderRadius: '10px',
              marginTop: '0.5rem',
            }}>
              <div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Net Cost</p>
                <span style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  ${netInstallCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </span>
              </div>

              <div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Payback Period</p>
                <span style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--warning-amber)' }}>
                  {paybackYears.toFixed(1)} <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>years</span>
                </span>
              </div>

              <div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Net Savings (25 yr)</p>
                <span style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--neon-emerald)' }}>
                  ${lifetimeSavings.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </span>
              </div>
            </div>

            {/* Advisory info block */}
            <div style={{
              display: 'flex',
              gap: '0.75rem',
              padding: '1rem',
              backgroundColor: 'var(--electric-blue-glow)',
              border: '1px solid hsla(210, 100%, 55%, 0.2)',
              borderRadius: '8px',
              fontSize: '0.825rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.4,
            }}>
              <Info size={16} color="var(--electric-blue)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                Calculations estimate <strong>{monthlyProduction.toFixed(0)} kWh/month</strong> of carbon-free generation. If your local utility provider supports net-metering rules, excess energy is credited to future statements.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
