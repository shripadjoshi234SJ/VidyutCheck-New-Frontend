import React from 'react';
import { Key, User, Landmark, ShieldCheck } from 'lucide-react';
import { UserSettings } from '../types';

interface SettingsProps {
  settings: UserSettings;
  setSettings: React.Dispatch<React.SetStateAction<UserSettings>>;
}

const Settings: React.FC<SettingsProps> = ({ settings, setSettings }) => {
  const handleInputChange = (field: keyof UserSettings, value: string) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.25rem', fontFamily: 'Outfit' }}>Auditor Settings</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Configure API credentials, utility provider preferences, and account defaults.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '1.5rem' }}>
        {/* Core settings */}
        <div className="glass-panel" style={{ padding: '2rem', gridColumn: 'span 7', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
            <Key size={20} color="var(--electric-blue)" />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Google AI Studio Integration</h3>
          </div>

          <div className="form-row">
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Gemini API Key</label>
              <input
                type="password"
                placeholder="Paste your GEMINI_API_KEY from Google AI Studio"
                value={settings.gemini_api_key}
                onChange={(e) => handleInputChange('gemini_api_key', e.target.value)}
                className="form-input"
                style={{ fontFamily: 'monospace' }}
              />
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem', lineHeight: 1.4 }}>
                Required for Google Gemini. Get it from the <a href="https://aistudio.google.com/" target="_blank" rel="noreferrer" style={{ color: 'var(--electric-blue)', textDecoration: 'underline' }}>Google AI Studio Console</a>.
              </p>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Grok API Key (xAI)</label>
              <input
                type="password"
                placeholder="Paste your GROK_API_KEY from xAI Console"
                value={settings.grok_api_key || ''}
                onChange={(e) => handleInputChange('grok_api_key', e.target.value)}
                className="form-input"
                style={{ fontFamily: 'monospace' }}
              />
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem', lineHeight: 1.4 }}>
                Required for xAI Grok. Get it from the <a href="https://console.x.ai/" target="_blank" rel="noreferrer" style={{ color: 'var(--vivid-purple)', textDecoration: 'underline' }}>xAI console</a>. Chatbot prefers Grok.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', marginTop: '1rem' }}>
            <User size={20} color="var(--vivid-purple)" />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Customer Account Presets</h3>
          </div>

          <div className="form-row">
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Default Customer Name</label>
              <input
                type="text"
                value={settings.customer_name}
                onChange={(e) => handleInputChange('customer_name', e.target.value)}
                className="form-input"
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Utility Account Number</label>
              <input
                type="text"
                value={settings.account_number}
                onChange={(e) => handleInputChange('account_number', e.target.value)}
                className="form-input"
              />
            </div>
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Default Service Address</label>
            <input
              type="text"
              value={settings.service_address}
              onChange={(e) => handleInputChange('service_address', e.target.value)}
              className="form-input"
            />
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Prefilled on dispute letter compiles.</p>
          </div>
        </div>

        {/* Informative column (Span 5) */}
        <div style={{ gridColumn: 'span 5', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <Landmark size={20} color="var(--warning-amber)" />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Tariff Auditing Rules</h3>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1rem' }}>
              Vidyutcheck audits charges against active regional schedules. When you audit a bill:
            </p>
            <ul style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', lineHeight: 1.4 }}>
              <li><strong>Energy Charges</strong> are verified by multiplying consumption by the tariff sheet kWh rate.</li>
              <li><strong>Demand Charges</strong> are verified by multiplying peak demand against the kW rate.</li>
              <li><strong>Power Factor Penalties</strong> are audited to verify if reactive power surcharges are mathematically correct.</li>
              <li><strong>Taxes</strong> are audited to ensure utility companies didn't charge municipality tax multipliers twice.</li>
            </ul>
          </div>

          <div className="glass-panel" style={{ padding: '2rem', background: 'var(--bg-surface-elevated)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <ShieldCheck size={20} color="var(--neon-emerald)" />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Security & Storage</h3>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              All configuration parameters, settings, and historical audit entries are saved locally inside your browser's <code>localStorage</code> database cache. No account credentials or API keys are stored on remote third-party systems.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
