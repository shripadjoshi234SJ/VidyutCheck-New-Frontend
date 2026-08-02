import React, { useState, useEffect } from 'react';
import { FileText, Copy, Download, RefreshCw, Check, Info } from 'lucide-react';
import { AuditRecord, UserSettings } from '../types';

interface DisputeReportsProps {
  audits: AuditRecord[];
  settings: UserSettings;
}

const DisputeReports: React.FC<DisputeReportsProps> = ({ audits, settings }) => {
  const anomalousAudits = audits.filter(a => a.result.has_discrepancies);

  const [selectedAuditId, setSelectedAuditId] = useState<string>('');
  const [formData, setFormData] = useState({
    customer_name: settings.customer_name || 'Tony Stark',
    account_number: settings.account_number || '9845-0982-12',
    service_address: settings.service_address || '10880 Malibu Point, Malibu, CA 90265',
    utility_provider: '',
    billing_period: '',
    disputed_amount: 0,
    currency: '₹',
    findings: [] as string[]
  });

  const [generatedLetter, setGeneratedLetter] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // Auto load first anomalous audit details
  useEffect(() => {
    if (anomalousAudits.length > 0) {
      const first = anomalousAudits[0];
      setSelectedAuditId(first.id);
      populateFromAudit(first);
    }
  }, [audits, settings]);

  const populateFromAudit = (audit: AuditRecord) => {
    const findingsList = audit.result.errors
      .filter(e => e.disputed_amount > 0 || e.type.includes('ERROR'))
      .map(e => e.message);

    setFormData({
      customer_name: settings.customer_name || 'Tony Stark',
      account_number: settings.account_number || '9845-0982-12',
      service_address: settings.service_address || '10880 Malibu Point, Malibu, CA 90265',
      utility_provider: audit.result.plan_name.split(' - ')[0],
      billing_period: audit.bill.billing_period,
      disputed_amount: audit.result.potential_savings,
      currency: audit.result.currency,
      findings: findingsList
    });
    setGeneratedLetter('');
  };

  const handleAuditSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setSelectedAuditId(id);
    const audit = audits.find(a => a.id === id);
    if (audit) populateFromAudit(audit);
  };

  const handleFormChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/dispute-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: formData.customer_name,
          account_number: formData.account_number,
          service_address: formData.service_address,
          utility_provider: formData.utility_provider,
          billing_period: formData.billing_period,
          audit_findings: formData.findings,
          disputed_amount: formData.disputed_amount,
          currency: formData.currency
        })
      });

      if (response.ok) {
        const data = await response.json();
        setGeneratedLetter(data.letter);
      } else {
        // Fallback local letter generation
        generateLocalLetter();
      }
    } catch (e) {
      generateLocalLetter();
    } finally {
      setIsLoading(false);
    }
  };

  const generateLocalLetter = () => {
    const bulletFindings = formData.findings.map(f => `- ${f}`).join('\n');
    const letter = `Date: July 29, 2026

To,
Billing & Customer Operations Department
${formData.utility_provider}

Subject: Formal Dispute of Electricity Charges - Account #${formData.account_number}

Dear Billing Manager,

I am writing to formally dispute the billing charges on my account #${formData.account_number} for the service address ${formData.service_address} relating to the billing cycle of ${formData.billing_period}. 

After running a detailed audit of the billed line items against the published tariff sheet of ${formData.utility_provider}, we discovered significant discrepancies totaling ${formData.currency}${formData.disputed_amount.toFixed(2)}. 

Below is the summary of audit findings and errors identified:
${bulletFindings}

Based on these discrepancies, I request that your department conducts a review of this statement, issue a corrected invoice, and credit my account for any overbillings. I request a response or confirmation of adjustment within 15 business days.

Thank you for your prompt attention to this matter.

Sincerely,

${formData.customer_name}
Contact: Via account records`;
    
    setGeneratedLetter(letter);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedLetter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadTextFile = () => {
    const element = document.createElement("a");
    const file = new Blob([generatedLetter], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `dispute_letter_${formData.billing_period.replace(' ', '_')}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.25rem', fontFamily: 'Outfit' }}>Billing Disputes & Reports</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Generate professional complaint letters outlining energy audit math errors.
        </p>
      </div>

      {anomalousAudits.length === 0 ? (
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
          <FileText size={48} color="var(--text-muted)" style={{ marginBottom: '1rem' }} />
          <h4 style={{ fontSize: '1.1rem', fontWeight: 600 }}>No Dispute Opportunities</h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            All audited statements match tariff sheets. If a bill contains calculation errors, run its audit to unlock disputes.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '1.5rem' }}>
          {/* Dispute details form */}
          <div className="glass-panel" style={{ padding: '2rem', gridColumn: 'span 5', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '0.5rem' }}>
              Dispute Parameters
            </h3>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Select Source Audit Log</label>
              <select
                value={selectedAuditId}
                onChange={handleAuditSelect}
                className="form-input"
              >
                {anomalousAudits.map(a => (
                  <option key={a.id} value={a.id}>{a.bill.billing_period} - Discovered {a.result.currency}{a.result.potential_savings} Overbilling</option>
                ))}
              </select>
            </div>

            <div className="form-row">
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Customer Name</label>
                <input
                  type="text"
                  value={formData.customer_name}
                  onChange={(e) => handleFormChange('customer_name', e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Account Number</label>
                <input
                  type="text"
                  value={formData.account_number}
                  onChange={(e) => handleFormChange('account_number', e.target.value)}
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Service Address</label>
              <input
                type="text"
                value={formData.service_address}
                onChange={(e) => handleFormChange('service_address', e.target.value)}
                className="form-input"
              />
            </div>

            <div className="form-row">
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Utility Provider</label>
                <input
                  type="text"
                  value={formData.utility_provider}
                  onChange={(e) => handleFormChange('utility_provider', e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Billing Cycle</label>
                <input
                  type="text"
                  value={formData.billing_period}
                  onChange={(e) => handleFormChange('billing_period', e.target.value)}
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Disputed Amount</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  value={formData.currency}
                  onChange={(e) => handleFormChange('currency', e.target.value)}
                  className="form-input"
                  style={{ width: '50px', textAlign: 'center' }}
                />
                <input
                  type="number"
                  step="any"
                  value={formData.disputed_amount}
                  onChange={(e) => handleFormChange('disputed_amount', parseFloat(e.target.value) || 0)}
                  className="form-input"
                  style={{ flex: 1 }}
                />
              </div>
            </div>

            <button className="btn-primary" onClick={handleGenerate} disabled={isLoading} style={{ justifyContent: 'center' }}>
              {isLoading ? (
                <>
                  <RefreshCw size={18} className="spinner" style={{ animation: 'spin 1s linear infinite' }} />
                  <span>Drafting Letter...</span>
                </>
              ) : (
                <>
                  <FileText size={18} />
                  <span>Compile Official Letter</span>
                </>
              )}
            </button>
          </div>

          {/* Letter preview */}
          <div className="glass-panel" style={{ padding: '2rem', gridColumn: 'span 7', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Dispute Draft Preview</h3>
              {generatedLetter && (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className="btn-secondary" onClick={copyToClipboard} style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
                    {copied ? <Check size={14} color="var(--neon-emerald)" /> : <Copy size={14} />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                  <button className="btn-secondary" onClick={downloadTextFile} style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
                    <Download size={14} />
                    <span>Download</span>
                  </button>
                </div>
              )}
            </div>

            {generatedLetter ? (
              <textarea
                value={generatedLetter}
                onChange={(e) => setGeneratedLetter(e.target.value)}
                style={{
                  flex: 1,
                  background: 'var(--bg-base)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  padding: '1.25rem',
                  color: 'var(--text-primary)',
                  fontSize: '0.875rem',
                  fontFamily: 'monospace',
                  lineHeight: 1.6,
                  resize: 'none',
                  minHeight: '380px',
                  outline: 'none',
                }}
              />
            ) : (
              <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-secondary)',
                border: '2px dashed var(--border-color)',
                borderRadius: '8px',
                padding: '2rem',
                minHeight: '380px',
                textAlign: 'center',
              }}>
                <FileText size={40} color="var(--text-muted)" style={{ marginBottom: '0.5rem' }} />
                <p style={{ fontSize: '0.9rem' }}>Fill parameter fields on the left and click compile to compose formal letters.</p>
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.5rem', background: 'var(--bg-surface-elevated)', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              <Info size={16} color="var(--electric-blue)" style={{ flexShrink: 0, marginTop: '1px' }} />
              <p>Disclaimer: Letters comply with standard state utility commission formats. Check with local regulators for specific dispute submission portals.</p>
            </div>
          </div>
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

export default DisputeReports;
