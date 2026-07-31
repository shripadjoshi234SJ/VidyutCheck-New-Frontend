import React, { useState } from 'react';
import { History, CheckCircle2, Eye, Trash2, Calendar } from 'lucide-react';
import { AuditRecord } from '../types';

interface AuditHistoryProps {
  audits: AuditRecord[];
  onClear: () => void;
}

const AuditHistory: React.FC<AuditHistoryProps> = ({ audits, onClear }) => {
  const [selectedAudit, setSelectedAudit] = useState<AuditRecord | null>(null);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.25rem', fontFamily: 'Outfit' }}>Audit History Log</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Historical utility statement records and active discrepancies.
          </p>
        </div>
        {audits.length > 0 && (
          <button className="btn-danger" onClick={onClear} style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
            <Trash2 size={16} />
            <span>Clear History</span>
          </button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '1.5rem' }}>
        {/* Table list */}
        <div className="glass-panel" style={{ padding: '1.5rem', gridColumn: selectedAudit ? 'span 7' : 'span 12', transition: 'var(--transition-smooth)' }}>
          {audits.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
              <History size={48} color="var(--text-muted)" />
              <div>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 600 }}>No Audits Recorded</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Execute an audit in the Bill Auditor tab to create logs.</p>
              </div>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    <th style={{ padding: '0.75rem 1rem' }}>Date Audited</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Statement Cycle</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Utility Provider</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Billed Amount</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Savings Found</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>Audit Status</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {audits.map((a) => (
                    <tr
                      key={a.id}
                      onClick={() => setSelectedAudit(a)}
                      style={{
                        borderBottom: '1px solid rgba(255,255,255,0.03)',
                        fontSize: '0.9rem',
                        cursor: 'pointer',
                        background: selectedAudit?.id === a.id ? 'var(--bg-surface-elevated)' : 'transparent',
                        transition: 'var(--transition-smooth)'
                      }}
                      onMouseEnter={(e) => { if (selectedAudit?.id !== a.id) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)'; }}
                      onMouseLeave={(e) => { if (selectedAudit?.id !== a.id) e.currentTarget.style.backgroundColor = 'transparent'; }}
                    >
                      <td style={{ padding: '1rem' }}>{new Date(a.date_audited).toLocaleDateString()}</td>
                      <td style={{ padding: '1rem', fontWeight: 600 }}>{a.bill.billing_period}</td>
                      <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{a.result.plan_name.split(' - ')[0]}</td>
                      <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 500 }}>
                        {a.result.currency}{a.bill.reported_total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 600, color: a.result.potential_savings > 0 ? 'var(--neon-emerald)' : 'var(--text-secondary)' }}>
                        {a.result.potential_savings > 0 ? `+${a.result.currency}${a.result.potential_savings.toFixed(2)}` : `${a.result.currency}0.00`}
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>
                        {a.result.has_discrepancies ? (
                          <span className="badge badge-danger">Anomaly</span>
                        ) : (
                          <span className="badge badge-success">Passed</span>
                        )}
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>
                        <button
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--electric-blue)',
                            cursor: 'pointer',
                            padding: '0.25rem',
                          }}
                        >
                          <Eye size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Detailed Drawer panel on right */}
        {selectedAudit && (
          <div className="glass-panel animate-fade-in" style={{ padding: '2rem', gridColumn: 'span 5', display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'relative' }}>
            <button
              onClick={() => setSelectedAudit(null)}
              style={{
                position: 'absolute',
                top: '1.25rem',
                right: '1.25rem',
                background: 'none',
                border: 'none',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
              }}
            >
              ✕
            </button>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '0.5rem' }}>
                <Calendar size={14} />
                <span>Audit recorded on {new Date(selectedAudit.date_audited).toLocaleString()}</span>
              </div>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 700 }}>
                Audit Details - {selectedAudit.bill.billing_period}
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{selectedAudit.result.plan_name}</p>
            </div>

            {/* Aggregated values */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1rem',
              backgroundColor: 'var(--bg-surface-elevated)',
              padding: '1rem',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
            }}>
              <div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Billed Total</p>
                <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--electric-blue)' }}>
                  {selectedAudit.result.currency}{selectedAudit.bill.reported_total.toLocaleString()}
                </span>
              </div>
              <div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Expected Total</p>
                <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--neon-emerald)' }}>
                  {selectedAudit.result.currency}{selectedAudit.result.expected_charges.total.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Error findings */}
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-secondary)' }}>Detected Discrepancies</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {selectedAudit.result.errors.map((e, idx) => (
                  <div key={idx} style={{
                    padding: '0.75rem 1rem',
                    backgroundColor: 'var(--bg-base)',
                    borderRadius: '8px',
                    borderLeft: `3px solid ${
                      e.severity === 'high' ? 'var(--coral-red)' : 
                      e.severity === 'medium' ? 'var(--warning-amber)' : 'var(--electric-blue)'
                    }`,
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>{e.type}</span>
                      {e.disputed_amount > 0 && (
                        <span style={{ fontSize: '0.8rem', color: 'var(--coral-red)', fontWeight: 600 }}>
                          +{selectedAudit.result.currency}{e.disputed_amount.toFixed(2)}
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: '0.825rem', color: 'var(--text-primary)', lineHeight: 1.4 }}>{e.message}</p>
                    {e.suggestion && (
                      <p style={{ fontSize: '0.75rem', color: 'var(--neon-emerald)', fontWeight: 600, marginTop: '0.25rem' }}>
                        💡 Suggestion: {e.suggestion}
                      </p>
                    )}
                  </div>
                ))}
                {selectedAudit.result.errors.length === 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--neon-emerald)', fontSize: '0.85rem' }}>
                    <CheckCircle2 size={16} />
                    <span>No discrepancies found in this billing cycle.</span>
                  </div>
                )}
              </div>
            </div>

            {/* Bill Specs Table */}
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Audited Inputs</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.85rem', backgroundColor: 'var(--bg-surface-elevated)', padding: '0.75rem', borderRadius: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Energy Consumption</span>
                  <span>{(selectedAudit.bill.consumption * selectedAudit.bill.meter_multiplier).toLocaleString()} kWh</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Measured Demand</span>
                  <span>{selectedAudit.bill.peak_demand} kW/kVA</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Power Factor</span>
                  <span style={{ color: selectedAudit.bill.power_factor < 0.90 ? 'var(--warning-amber)' : 'var(--neon-emerald)' }}>
                    {selectedAudit.bill.power_factor}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Meter Multiplier</span>
                  <span>{selectedAudit.bill.meter_multiplier}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditHistory;
