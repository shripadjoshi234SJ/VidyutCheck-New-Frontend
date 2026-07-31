import React, { useState } from 'react';
import { ShieldCheck, RefreshCw, AlertCircle, CheckCircle2, Upload, FileText, Image, Sparkles, CloudUpload } from 'lucide-react';
import { BillInput, AuditResult, UserSettings, AuditRecord } from '../types';
import { sampleBills } from '../data/sampleBills';

interface BillAuditorProps {
  settings: UserSettings;
  onAuditComplete: (record: AuditRecord) => void;
  isBackendConnected: boolean;
}

const BillAuditor: React.FC<BillAuditorProps> = ({ settings: _settings, onAuditComplete, isBackendConnected }) => {
  const [activeScenarioId, setActiveScenarioId] = useState<string>('');
  const [formData, setFormData] = useState<BillInput>({
    provider_id: 'us-coned-commercial',
    billing_period: 'July 2026',
    contracted_load: 50.0,
    peak_demand: 45.0,
    consumption: 12000.0,
    power_factor: 0.90,
    meter_multiplier: 1.0,
    reported_energy_charge: 2160.00,
    reported_demand_charge: 832.50,
    reported_fixed_charge: 25.00,
    reported_taxes: 256.48,
    reported_surcharges: 120.00,
    reported_total: 3393.98
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null);
  
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadMessage, setUploadMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' | null }>({ text: '', type: null });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processFile(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      await processFile(file);
    }
  };

  const processFile = async (file: File) => {
    setIsUploading(true);
    setUploadMessage({ text: 'Analyzing utility bill with Gemini AI...', type: 'info' });
    
    const formDataObj = new FormData();
    formDataObj.append('file', file);
    
    try {
      const response = await fetch('/api/upload-bill', {
        method: 'POST',
        body: formDataObj,
      });
      
      if (!response.ok) {
        throw new Error('Server returned an error');
      }
      
      const result = await response.json();
      if (result.success && result.data) {
        setFormData(result.data);
        setUploadMessage({
          text: result.message || 'Bill parsed successfully! Form fields pre-filled.',
          type: 'success'
        });
        
        setTimeout(() => {
          runAuditWithData(result.data);
        }, 800);
      } else {
        throw new Error(result.message || 'Could not parse bill data');
      }
    } catch (error: any) {
      setUploadMessage({
        text: `Extraction error: ${error.message || 'Connection failed'}. Using offline fallback mockup.`,
        type: 'error'
      });
      
      const fallbackData = {
        provider_id: "us-coned-commercial",
        billing_period: "July 2026",
        contracted_load: 50.0,
        peak_demand: 45.0,
        consumption: 12000.0,
        power_factor: 0.84,
        meter_multiplier: 1.0,
        reported_energy_charge: 2560.00,
        reported_demand_charge: 832.50,
        reported_fixed_charge: 25.00,
        reported_taxes: 420.50,
        reported_surcharges: 120.00,
        reported_total: 3958.00
      };
      setFormData(fallbackData);
      setTimeout(() => {
        runAuditWithData(fallbackData);
      }, 1500);
    } finally {
      setIsUploading(false);
    }
  };

  const runAuditWithData = async (data: BillInput) => {
    setIsLoading(true);
    setAuditResult(null);
    try {
      if (isBackendConnected) {
        const response = await fetch('/api/audit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        if (response.ok) {
          const resData: AuditResult = await response.json();
          setAuditResult(resData);
          onAuditComplete({
            id: `audit-${Date.now()}`,
            bill: data,
            result: resData,
            date_audited: new Date().toISOString()
          });
          setIsLoading(false);
          return;
        }
      }
      
      const mockTariffs: Record<string, any> = {
        "us-pge-residential": { name: "PG&E Residential E-1", energy_rate: 0.32, demand_charge_rate: 0, fixed_charge: 10, tax_rate: 0.08 },
        "us-coned-commercial": { name: "ConEd Commercial EL2", energy_rate: 0.18, demand_charge_rate: 18.50, fixed_charge: 25, tax_rate: 0.085, power_factor_threshold: 0.90 },
        "in-msedcl-industrial": { name: "MSEDCL Industrial HT-I", energy_rate: 8.50, demand_charge_rate: 450, fixed_charge: 500, tax_rate: 0.16, power_factor_threshold: 0.90 },
        "in-bescom-commercial": { name: "BESCOM Commercial LT-3", energy_rate: 7.20, demand_charge_rate: 220, fixed_charge: 150, tax_rate: 0.09, power_factor_threshold: 0.85 }
      };

      const tariff = mockTariffs[data.provider_id] || mockTariffs["us-coned-commercial"];
      const errors = [];
      let savings = 0;

      const expEnergy = round(data.consumption * data.meter_multiplier * tariff.energy_rate, 2);
      if (Math.abs(data.reported_energy_charge - expEnergy) > 1.0) {
        errors.push({
          type: "ENERGY_CHARGE_ERROR",
          severity: "high" as const,
          message: `Expected energy charge of ${data.provider_id.startsWith('in') ? '₹' : '$'}${expEnergy} (based on ${data.consumption} kWh * rate ${tariff.energy_rate}), but was billed ${data.provider_id.startsWith('in') ? '₹' : '$'}${data.reported_energy_charge}.`,
          disputed_amount: round(data.reported_energy_charge - expEnergy, 2)
        });
        savings += Math.max(0, data.reported_energy_charge - expEnergy);
      }

      const expDemand = round(data.peak_demand * tariff.demand_charge_rate, 2);
      if (Math.abs(data.reported_demand_charge - expDemand) > 1.0) {
        errors.push({
          type: "DEMAND_CHARGE_ERROR",
          severity: "medium" as const,
          message: `Expected demand charge of ${data.provider_id.startsWith('in') ? '₹' : '$'}${expDemand} (based on demand ${data.peak_demand} kW * rate ${tariff.demand_charge_rate}), but was billed ${data.provider_id.startsWith('in') ? '₹' : '$'}${data.reported_demand_charge}.`,
          disputed_amount: round(data.reported_demand_charge - expDemand, 2)
        });
        savings += Math.max(0, data.reported_demand_charge - expDemand);
      }

      if (tariff.power_factor_threshold && data.power_factor < tariff.power_factor_threshold) {
        errors.push({
          type: "LOW_POWER_FACTOR_WARNING",
          severity: "warning" as const,
          message: `Low Power Factor (${data.power_factor}). Install capacitor banks to raise PF and save penalties.`,
          disputed_amount: 0.0,
          actionable: true,
          suggestion: "Install 15 kVAR capacitor banks to correct power factor."
        });
      }

      const expTaxes = round((expEnergy + expDemand + tariff.fixed_charge + data.reported_surcharges) * tariff.tax_rate, 2);
      if (Math.abs(data.reported_taxes - expTaxes) > 2.0) {
        errors.push({
          type: "TAX_CALCULATION_ERROR",
          severity: "medium" as const,
          message: `Expected taxes of ${data.provider_id.startsWith('in') ? '₹' : '$'}${expTaxes} (rate of ${tariff.tax_rate * 100}%), but was billed ${data.provider_id.startsWith('in') ? '₹' : '$'}${data.reported_taxes}.`,
          disputed_amount: round(data.reported_taxes - expTaxes, 2)
        });
        savings += Math.max(0, data.reported_taxes - expTaxes);
      }

      const expTotal = round(expEnergy + expDemand + tariff.fixed_charge + data.reported_surcharges + expTaxes, 2);
      const mathDiff = round(Math.abs(data.reported_total - (data.reported_energy_charge + data.reported_demand_charge + data.reported_fixed_charge + data.reported_surcharges + data.reported_taxes)), 2);
      if (mathDiff > 0.1) {
        errors.push({
          type: "SUMMATION_ERROR",
          severity: "high" as const,
          message: `Line items do not sum to total billing charge (discrepancy of ${mathDiff}).`,
          disputed_amount: mathDiff
        });
        savings += mathDiff;
      }

      const localResult: AuditResult = {
        plan_name: tariff.name,
        currency: data.provider_id.startsWith('in') ? '₹' : '$',
        has_discrepancies: errors.length > 0,
        errors: errors,
        expected_charges: {
          energy_charge: expEnergy,
          demand_charge: expDemand,
          fixed_charge: tariff.fixed_charge,
          taxes: expTaxes,
          surcharges: data.reported_surcharges,
          total: expTotal
        },
        potential_savings: round(savings, 2)
      };

      setAuditResult(localResult);
      onAuditComplete({
        id: `audit-${Date.now()}`,
        bill: data,
        result: localResult,
        date_audited: new Date().toISOString()
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Quick select standard bill scenarios
  const handleScenarioSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setActiveScenarioId(id);
    if (!id) return;
    
    const scenario = sampleBills.find(s => s.id === id);
    if (scenario) {
      setFormData({ ...scenario.bill });
      // Reset audit screen
      setAuditResult(null);
    }
  };

  const handleInputChange = (field: keyof BillInput, value: string | number) => {
    let numVal = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(numVal)) numVal = 0;
    
    setFormData(prev => ({
      ...prev,
      [field]: typeof prev[field] === 'number' ? numVal : value
    }));
  };

  const executeAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setAuditResult(null);

    // Simulate short network delay for premium visual feel
    setTimeout(async () => {
      try {
        if (isBackendConnected) {
          const response = await fetch('/api/audit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
          });
          if (response.ok) {
            const data: AuditResult = await response.json();
            setAuditResult(data);
            onAuditComplete({
              id: `audit-${Date.now()}`,
              bill: formData,
              result: data,
              date_audited: new Date().toISOString()
            });
            setIsLoading(false);
            return;
          }
        }
        
        // Local Fallback Audit Logic
        // This makes sure the application works fully offline or if backend uvicorn is not running.
        const mockTariffs: Record<string, any> = {
          "us-pge-residential": { name: "PG&E Residential E-1", energy_rate: 0.32, demand_charge_rate: 0, fixed_charge: 10, tax_rate: 0.08 },
          "us-coned-commercial": { name: "ConEd Commercial EL2", energy_rate: 0.18, demand_charge_rate: 18.50, fixed_charge: 25, tax_rate: 0.085, power_factor_threshold: 0.90 },
          "in-msedcl-industrial": { name: "MSEDCL Industrial HT-I", energy_rate: 8.50, demand_charge_rate: 450, fixed_charge: 500, tax_rate: 0.16, power_factor_threshold: 0.90 },
          "in-bescom-commercial": { name: "BESCOM Commercial LT-3", energy_rate: 7.20, demand_charge_rate: 220, fixed_charge: 150, tax_rate: 0.09, power_factor_threshold: 0.85 }
        };

        const tariff = mockTariffs[formData.provider_id];
        const errors = [];
        let savings = 0;

        const expEnergy = round(formData.consumption * formData.meter_multiplier * tariff.energy_rate, 2);
        if (Math.abs(formData.reported_energy_charge - expEnergy) > 1.0) {
          errors.push({
            type: "ENERGY_CHARGE_ERROR",
            severity: "high" as const,
            message: `Expected energy charge of ${formData.provider_id.startsWith('in') ? '₹' : '$'}${expEnergy} (based on ${formData.consumption} kWh * rate ${tariff.energy_rate}), but was billed ${formData.provider_id.startsWith('in') ? '₹' : '$'}${formData.reported_energy_charge}.`,
            disputed_amount: round(formData.reported_energy_charge - expEnergy, 2)
          });
          savings += Math.max(0, formData.reported_energy_charge - expEnergy);
        }

        const expDemand = round(formData.peak_demand * tariff.demand_charge_rate, 2);
        if (Math.abs(formData.reported_demand_charge - expDemand) > 1.0) {
          errors.push({
            type: "DEMAND_CHARGE_ERROR",
            severity: "medium" as const,
            message: `Expected demand charge of ${formData.provider_id.startsWith('in') ? '₹' : '$'}${expDemand} (based on demand ${formData.peak_demand} kW * rate ${tariff.demand_charge_rate}), but was billed ${formData.provider_id.startsWith('in') ? '₹' : '$'}${formData.reported_demand_charge}.`,
            disputed_amount: round(formData.reported_demand_charge - expDemand, 2)
          });
          savings += Math.max(0, formData.reported_demand_charge - expDemand);
        }

        if (tariff.power_factor_threshold && formData.power_factor < tariff.power_factor_threshold) {
          errors.push({
            type: "LOW_POWER_FACTOR_WARNING",
            severity: "warning" as const,
            message: `Low Power Factor (${formData.power_factor}). Install capacitor banks to raise PF and save penalties.`,
            disputed_amount: 0.0,
            actionable: true,
            suggestion: "Install 15 kVAR capacitor banks to correct power factor."
          });
        }

        const expTaxes = round((expEnergy + expDemand + tariff.fixed_charge + formData.reported_surcharges) * tariff.tax_rate, 2);
        if (Math.abs(formData.reported_taxes - expTaxes) > 2.0) {
          errors.push({
            type: "TAX_CALCULATION_ERROR",
            severity: "medium" as const,
            message: `Expected taxes of ${formData.provider_id.startsWith('in') ? '₹' : '$'}${expTaxes} (rate of ${tariff.tax_rate * 100}%), but was billed ${formData.provider_id.startsWith('in') ? '₹' : '$'}${formData.reported_taxes}.`,
            disputed_amount: round(formData.reported_taxes - expTaxes, 2)
          });
          savings += Math.max(0, formData.reported_taxes - expTaxes);
        }

        const expTotal = round(expEnergy + expDemand + tariff.fixed_charge + formData.reported_surcharges + expTaxes, 2);
        const mathDiff = round(Math.abs(formData.reported_total - (formData.reported_energy_charge + formData.reported_demand_charge + formData.reported_fixed_charge + formData.reported_surcharges + formData.reported_taxes)), 2);
        if (mathDiff > 0.1) {
          errors.push({
            type: "SUMMATION_ERROR",
            severity: "high" as const,
            message: `Line items do not sum to total billing charge (discrepancy of ${mathDiff}).`,
            disputed_amount: mathDiff
          });
          savings += mathDiff;
        }

        const localResult: AuditResult = {
          plan_name: tariff.name,
          currency: formData.provider_id.startsWith('in') ? '₹' : '$',
          has_discrepancies: errors.length > 0,
          errors: errors,
          expected_charges: {
            energy_charge: expEnergy,
            demand_charge: expDemand,
            fixed_charge: tariff.fixed_charge,
            taxes: expTaxes,
            surcharges: formData.reported_surcharges,
            total: expTotal
          },
          potential_savings: round(savings, 2)
        };

        setAuditResult(localResult);
        onAuditComplete({
          id: `audit-${Date.now()}`,
          bill: formData,
          result: localResult,
          date_audited: new Date().toISOString()
        });

      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }, 1500);
  };

  const round = (num: number, decimals: number) => {
    const factor = Math.pow(10, decimals);
    return Math.round(num * factor) / factor;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* Page heading */}
      <div className="animate-fade-in">
        <h2 style={{ fontSize: '1.9rem', fontWeight: 800, marginBottom: '0.25rem', fontFamily: 'Outfit' }}>Bill Auditor Engine</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Upload your bill or enter values manually — we check every charge against official tariff schedules.
        </p>
      </div>

      {/* ════════════════════════════════════════════════
          UPLOAD BILL — prominent hero card
      ════════════════════════════════════════════════ */}
      <div className="animate-fade-in animate-delay-100 neon-border active" style={{
        background: 'linear-gradient(135deg, hsla(272,85%,60%,0.1) 0%, hsla(210,100%,55%,0.08) 50%, hsla(145,80%,50%,0.05) 100%)',
        border: '1px solid hsla(272,85%,60%,0.35)',
        borderRadius: '16px', padding: '1.75rem 2rem',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* bg decorations */}
        <div style={{ position:'absolute', top:'-30px', right:'-30px', width:'180px', height:'180px', borderRadius:'50%',
          background:'radial-gradient(circle, hsla(272,85%,60%,0.18) 0%, transparent 70%)', pointerEvents:'none' }}></div>
        <div style={{ position:'absolute', bottom:'-20px', left:'30%', width:'140px', height:'140px', borderRadius:'50%',
          background:'radial-gradient(circle, hsla(210,100%,55%,0.1) 0%, transparent 70%)', pointerEvents:'none' }}></div>

        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:'1.5rem', flexWrap:'wrap', position:'relative', zIndex:1 }}>
          {/* Left: headline + drop zone */}
          <div style={{ flex:'1 1 350px' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'0.65rem', marginBottom:'0.65rem' }}>
              <div style={{ width:'40px', height:'40px', borderRadius:'10px', flexShrink:0,
                background:'linear-gradient(135deg, var(--vivid-purple) 0%, var(--electric-blue) 100%)',
                display:'flex', alignItems:'center', justifyContent:'center',
                boxShadow:'0 0 20px hsla(272,85%,60%,0.45)' }}>
                <CloudUpload size={20} color="#fff" />
              </div>
              <div>
                <h3 style={{ fontSize:'1.15rem', fontWeight:800, lineHeight:1.1 }}>Upload Electricity Bill</h3>
                <p style={{ fontSize:'0.75rem', color:'var(--text-muted)' }}>Powered by Gemini AI Vision — reads PDF, PNG, JPG</p>
              </div>
              <span className="badge badge-purple" style={{ marginLeft:'auto' }}>
                <Sparkles size={10} /> AI Extract
              </span>
            </div>

            {/* Drop zone */}
            <div
              className={`upload-zone${isUploading ? ' uploading scan-beam' : ''}`}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => document.getElementById('bill-file-input')?.click()}
            >
              <input id="bill-file-input" type="file" accept="image/*,application/pdf"
                onChange={handleFileUpload} style={{ display:'none' }} />

              {isUploading ? (
                <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'0.75rem', padding:'0.5rem 0' }}>
                  <div className="spinner-ring"></div>
                  <span style={{ fontSize:'0.92rem', fontWeight:700, color:'var(--electric-blue)' }}>Gemini AI Reading Invoice…</span>
                  <span style={{ fontSize:'0.76rem', color:'var(--text-muted)' }}>Scanning text, tables, and all billing line items</span>
                </div>
              ) : (
                <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'0.55rem' }}>
                  <div style={{ display:'flex', gap:'0.75rem', marginBottom:'0.25rem' }}>
                    <div style={{ padding:'0.4rem', borderRadius:'8px', background:'var(--vivid-purple-glow)', border:'1px solid hsla(272,85%,60%,0.25)' }}>
                      <FileText size={20} color="var(--vivid-purple)" />
                    </div>
                    <div style={{ padding:'0.4rem', borderRadius:'8px', background:'var(--electric-blue-glow)', border:'1px solid hsla(210,100%,55%,0.25)' }}>
                      <Image size={20} color="var(--electric-blue)" />
                    </div>
                  </div>
                  <span style={{ fontSize:'0.95rem', fontWeight:700 }}>Drag & drop your utility statement here</span>
                  <span style={{ fontSize:'0.78rem', color:'var(--text-muted)' }}>PDF, PNG, JPG — up to 10 MB</span>
                  <button type="button" className="btn-upload" style={{ marginTop:'0.35rem', padding:'0.45rem 1.2rem', fontSize:'0.82rem' }}
                    onClick={e => { e.stopPropagation(); document.getElementById('bill-file-input')?.click(); }}>
                    <Upload size={14} /><span>Select File</span>
                  </button>
                </div>
              )}
            </div>

            {/* Upload status message */}
            {uploadMessage.text && (
              <div style={{
                marginTop:'0.75rem', padding:'0.7rem 1rem', borderRadius:'9px',
                fontSize:'0.84rem', display:'flex', alignItems:'flex-start', gap:'0.55rem',
                border:'1px solid',
                background: uploadMessage.type==='success' ? 'hsla(145,80%,50%,0.08)'
                          : uploadMessage.type==='error'   ? 'hsla(355,85%,55%,0.08)' : 'hsla(210,100%,55%,0.08)',
                borderColor: uploadMessage.type==='success' ? 'var(--neon-emerald)'
                           : uploadMessage.type==='error'   ? 'var(--coral-red)' : 'var(--electric-blue)',
                color: uploadMessage.type==='success' ? 'var(--neon-emerald)'
                     : uploadMessage.type==='error'   ? 'var(--coral-red)' : 'var(--text-primary)',
              }}>
                <span style={{ fontSize:'1rem', flexShrink:0 }}>{uploadMessage.type==='success'?'✓':uploadMessage.type==='error'?'⚠':'ℹ'}</span>
                <span style={{ lineHeight:1.4 }}>{uploadMessage.text}</span>
              </div>
            )}
          </div>

          {/* Right: how-it-works steps */}
          <div style={{ flex:'0 0 240px', display:'flex', flexDirection:'column', gap:'0.85rem' }}>
            <p style={{ fontSize:'0.78rem', fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.08em' }}>How it works</p>
            {[
              { step:'1', text:'Drop your electricity bill (any format)' },
              { step:'2', text:'Gemini AI extracts every billing field' },
              { step:'3', text:'Audit runs instantly against tariff rates' },
            ].map(({ step, text }) => (
              <div key={step} style={{ display:'flex', alignItems:'flex-start', gap:'0.7rem' }}>
                <div style={{ width:'22px', height:'22px', borderRadius:'50%', flexShrink:0,
                  background:'linear-gradient(135deg, var(--electric-blue) 0%, var(--vivid-purple) 100%)',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize:'0.72rem', fontWeight:800, color:'#fff' }}>{step}</div>
                <p style={{ fontSize:'0.82rem', color:'var(--text-secondary)', lineHeight:1.45, paddingTop:'1px' }}>{text}</p>
              </div>
            ))}
            <div style={{ marginTop:'0.5rem', padding:'0.6rem 0.9rem', borderRadius:'9px',
              background:'hsla(145,80%,50%,0.07)', border:'1px solid hsla(145,80%,50%,0.2)',
              display:'flex', alignItems:'center', gap:'0.5rem' }}>
              <div style={{ width:'6px', height:'6px', borderRadius:'50%', background:'var(--neon-emerald)', flexShrink:0, boxShadow:'0 0 6px var(--neon-emerald)' }}></div>
              <span style={{ fontSize:'0.76rem', color:'var(--neon-emerald)', fontWeight:600 }}>
                {isBackendConnected ? 'Backend connected — AI extraction live' : 'Offline mode — demo fallback active'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '1.5rem' }}>
        {/* Input Form Column */}
        <form onSubmit={executeAudit} className="glass-panel" style={{ padding: '2rem', gridColumn: auditResult ? 'span 5' : 'span 12', transition: 'var(--transition-smooth)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Enter Statement Parameters</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <select
                onChange={handleScenarioSelect}
                value={activeScenarioId}
                style={{
                  background: 'var(--bg-surface-elevated)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '6px',
                  padding: '0.35rem 0.6rem',
                  fontSize: '0.8rem',
                  outline: 'none',
                }}
              >
                <option value="">-- Load Erroneous Sample --</option>
                {sampleBills.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Row 1 */}
            <div className="form-row">
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Utility Provider Tariff</label>
                <select
                  value={formData.provider_id}
                  onChange={(e) => handleInputChange('provider_id', e.target.value)}
                  className="form-input"
                >
                  <option value="us-pge-residential">PG&E E-1 Residential (California)</option>
                  <option value="us-coned-commercial">ConEd EL2 Commercial (New York)</option>
                  <option value="in-msedcl-industrial">MSEDCL HT-I Industrial (Maharashtra)</option>
                  <option value="in-bescom-commercial">BESCOM LT-3 Commercial (Karnataka)</option>
                </select>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Billing Statement Cycle</label>
                <input
                  type="text"
                  value={formData.billing_period}
                  onChange={(e) => handleInputChange('billing_period', e.target.value)}
                  className="form-input"
                  placeholder="e.g. July 2026"
                  required
                />
              </div>
            </div>

            {/* Row 2 - Tech metrics */}
            <div className="form-row">
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Total Energy Active (kWh)</label>
                <input
                  type="number"
                  step="any"
                  value={formData.consumption}
                  onChange={(e) => handleInputChange('consumption', e.target.value)}
                  className="form-input"
                  required
                />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Peak Demand Load (kW/kVA)</label>
                <input
                  type="number"
                  step="any"
                  value={formData.peak_demand}
                  onChange={(e) => handleInputChange('peak_demand', e.target.value)}
                  className="form-input"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Contracted Load (kW/kVA)</label>
                <input
                  type="number"
                  step="any"
                  value={formData.contracted_load}
                  onChange={(e) => handleInputChange('contracted_load', e.target.value)}
                  className="form-input"
                  required
                />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Measured Power Factor (0-1.0)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.1"
                  max="1.0"
                  value={formData.power_factor}
                  onChange={(e) => handleInputChange('power_factor', e.target.value)}
                  className="form-input"
                  required
                />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Meter Multiplier Factor</label>
                <input
                  type="number"
                  step="any"
                  value={formData.meter_multiplier}
                  onChange={(e) => handleInputChange('meter_multiplier', e.target.value)}
                  className="form-input"
                  required
                />
              </div>
            </div>

            {/* Billed Charges Input Header */}
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', marginTop: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.25rem' }}>
              Billed Statement Line Items
            </div>

            <div className="form-row">
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Energy Charge</label>
                <input
                  type="number"
                  step="any"
                  value={formData.reported_energy_charge}
                  onChange={(e) => handleInputChange('reported_energy_charge', e.target.value)}
                  className="form-input"
                  required
                />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Demand Charge</label>
                <input
                  type="number"
                  step="any"
                  value={formData.reported_demand_charge}
                  onChange={(e) => handleInputChange('reported_demand_charge', e.target.value)}
                  className="form-input"
                  required
                />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Fixed Customer Fee</label>
                <input
                  type="number"
                  step="any"
                  value={formData.reported_fixed_charge}
                  onChange={(e) => handleInputChange('reported_fixed_charge', e.target.value)}
                  className="form-input"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Taxes & Surcharges</label>
                <input
                  type="number"
                  step="any"
                  value={formData.reported_taxes}
                  onChange={(e) => handleInputChange('reported_taxes', e.target.value)}
                  className="form-input"
                  required
                />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Regulatory Riders/Surcharges</label>
                <input
                  type="number"
                  step="any"
                  value={formData.reported_surcharges}
                  onChange={(e) => handleInputChange('reported_surcharges', e.target.value)}
                  className="form-input"
                  required
                />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Billed Total Amount</label>
                <input
                  type="number"
                  step="any"
                  value={formData.reported_total}
                  onChange={(e) => handleInputChange('reported_total', e.target.value)}
                  className="form-input"
                  style={{ border: '1px solid var(--electric-blue)' }}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary"
              style={{ padding: '0.85rem', justifyContent: 'center', marginTop: '0.75rem' }}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <RefreshCw size={18} className="spinner" style={{ animation: 'spin 1s linear infinite' }} />
                  <span>Auditing Charges against Tariffs...</span>
                </>
              ) : (
                <>
                  <ShieldCheck size={18} />
                  <span>Execute Bill Audit</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Audit Results Column */}
        {auditResult && (
          <div className="glass-panel animate-fade-in" style={{ padding: '2rem', gridColumn: 'span 7', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Audit Result Analysis</h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Verified against: {auditResult.plan_name}</span>
              </div>
              <div>
                {auditResult.has_discrepancies ? (
                  <span className="badge badge-danger" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>Billing Anomalies Found</span>
                ) : (
                  <span className="badge badge-success" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>Verification Passed</span>
                )}
              </div>
            </div>

            {/* Savings panel */}
            {auditResult.has_discrepancies && auditResult.potential_savings > 0 && (
              <div style={{
                background: 'linear-gradient(135deg, hsla(145, 80%, 50%, 0.1) 0%, hsla(145, 80%, 30%, 0.05) 100%)',
                border: '1px solid hsla(145, 80%, 50%, 0.3)',
                padding: '1.25rem',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <div>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Disputable Overbilling Savings</h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Found calculation errors on current cycle statement.</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--neon-emerald)' }}>
                    {auditResult.currency}{auditResult.potential_savings.toFixed(2)}
                  </span>
                </div>
              </div>
            )}

            {/* Line items comparison grid */}
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-secondary)' }}>Line-Item Audit Comparison</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr 1fr 1fr', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.25rem' }}>
                  <span>Line Item</span>
                  <span style={{ textAlign: 'right' }}>Billed</span>
                  <span style={{ textAlign: 'right' }}>Audited Expected</span>
                  <span style={{ textAlign: 'right' }}>Variance</span>
                </div>

                {/* Energy */}
                <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr 1fr 1fr', fontSize: '0.9rem', padding: '0.25rem 0' }}>
                  <span style={{ fontWeight: 500 }}>Active Energy</span>
                  <span style={{ textAlign: 'right' }}>{auditResult.currency}{formData.reported_energy_charge.toFixed(2)}</span>
                  <span style={{ textAlign: 'right' }}>{auditResult.currency}{auditResult.expected_charges.energy_charge.toFixed(2)}</span>
                  <span style={{ textAlign: 'right', color: Math.abs(formData.reported_energy_charge - auditResult.expected_charges.energy_charge) > 1.0 ? 'var(--coral-red)' : 'var(--text-secondary)' }}>
                    {auditResult.currency}{(formData.reported_energy_charge - auditResult.expected_charges.energy_charge).toFixed(2)}
                  </span>
                </div>

                {/* Demand */}
                {tariffHasDemand(formData.provider_id) && (
                  <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr 1fr 1fr', fontSize: '0.9rem', padding: '0.25rem 0' }}>
                    <span style={{ fontWeight: 500 }}>Peak Demand</span>
                    <span style={{ textAlign: 'right' }}>{auditResult.currency}{formData.reported_demand_charge.toFixed(2)}</span>
                    <span style={{ textAlign: 'right' }}>{auditResult.currency}{auditResult.expected_charges.demand_charge.toFixed(2)}</span>
                    <span style={{ textAlign: 'right', color: Math.abs(formData.reported_demand_charge - auditResult.expected_charges.demand_charge) > 1.0 ? 'var(--coral-red)' : 'var(--text-secondary)' }}>
                      {auditResult.currency}{(formData.reported_demand_charge - auditResult.expected_charges.demand_charge).toFixed(2)}
                    </span>
                  </div>
                )}

                {/* Fixed */}
                <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr 1fr 1fr', fontSize: '0.9rem', padding: '0.25rem 0' }}>
                  <span style={{ fontWeight: 500 }}>Customer Fixed Charge</span>
                  <span style={{ textAlign: 'right' }}>{auditResult.currency}{formData.reported_fixed_charge.toFixed(2)}</span>
                  <span style={{ textAlign: 'right' }}>{auditResult.currency}{auditResult.expected_charges.fixed_charge.toFixed(2)}</span>
                  <span style={{ textAlign: 'right', color: Math.abs(formData.reported_fixed_charge - auditResult.expected_charges.fixed_charge) > 0.1 ? 'var(--coral-red)' : 'var(--text-secondary)' }}>
                    {auditResult.currency}{(formData.reported_fixed_charge - auditResult.expected_charges.fixed_charge).toFixed(2)}
                  </span>
                </div>

                {/* Taxes */}
                <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr 1fr 1fr', fontSize: '0.9rem', padding: '0.25rem 0' }}>
                  <span style={{ fontWeight: 500 }}>Utility Taxes</span>
                  <span style={{ textAlign: 'right' }}>{auditResult.currency}{formData.reported_taxes.toFixed(2)}</span>
                  <span style={{ textAlign: 'right' }}>{auditResult.currency}{auditResult.expected_charges.taxes.toFixed(2)}</span>
                  <span style={{ textAlign: 'right', color: Math.abs(formData.reported_taxes - auditResult.expected_charges.taxes) > 2.0 ? 'var(--coral-red)' : 'var(--text-secondary)' }}>
                    {auditResult.currency}{(formData.reported_taxes - auditResult.expected_charges.taxes).toFixed(2)}
                  </span>
                </div>

                {/* Surcharges */}
                <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr 1fr 1fr', fontSize: '0.9rem', padding: '0.25rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem' }}>
                  <span style={{ fontWeight: 500 }}>Riders/Surcharges</span>
                  <span style={{ textAlign: 'right' }}>{auditResult.currency}{formData.reported_surcharges.toFixed(2)}</span>
                  <span style={{ textAlign: 'right' }}>{auditResult.currency}{auditResult.expected_charges.surcharges.toFixed(2)}</span>
                  <span style={{ textAlign: 'right', color: 'var(--text-secondary)' }}>
                    {auditResult.currency}0.00
                  </span>
                </div>

                {/* Total */}
                <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr 1fr 1fr', fontSize: '1rem', fontWeight: 700, padding: '0.5rem 0' }}>
                  <span>Billing Statement Total</span>
                  <span style={{ textAlign: 'right', color: 'var(--electric-blue)' }}>{auditResult.currency}{formData.reported_total.toFixed(2)}</span>
                  <span style={{ textAlign: 'right', color: 'var(--neon-emerald)' }}>{auditResult.currency}{auditResult.expected_charges.total.toFixed(2)}</span>
                  <span style={{ textAlign: 'right', color: Math.abs(formData.reported_total - auditResult.expected_charges.total) > 1.0 ? 'var(--coral-red)' : 'var(--neon-emerald)' }}>
                    {auditResult.currency}{(formData.reported_total - auditResult.expected_charges.total).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* List of discrepancies */}
            <div style={{ flex: 1 }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-secondary)' }}>Audit Discrepancies Details</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {auditResult.errors.map((err, idx) => (
                  <div key={idx} style={{
                    display: 'flex',
                    gap: '0.75rem',
                    padding: '0.85rem 1rem',
                    backgroundColor: 'var(--bg-surface-elevated)',
                    border: `1px solid ${
                      err.severity === 'high' ? 'hsla(355, 85%, 55%, 0.3)' : 
                      err.severity === 'medium' ? 'hsla(40, 95%, 50%, 0.3)' : 'hsla(210, 100%, 55%, 0.2)'
                    }`,
                    borderRadius: '8px',
                  }}>
                    <AlertCircle size={18} style={{
                      color: err.severity === 'high' ? 'var(--coral-red)' : 
                             err.severity === 'medium' ? 'var(--warning-amber)' : 'var(--electric-blue)',
                      flexShrink: 0,
                      marginTop: '2px'
                    }} />
                    <div>
                      <p style={{ fontSize: '0.85rem', lineHeight: 1.4 }}>{err.message}</p>
                      {err.suggestion && (
                        <p style={{ fontSize: '0.8rem', color: 'var(--neon-emerald)', fontWeight: 600, marginTop: '0.25rem' }}>
                          💡 Suggestion: {err.suggestion}
                        </p>
                      )}
                    </div>
                  </div>
                ))}

                {auditResult.errors.length === 0 && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '1rem',
                    backgroundColor: 'hsla(145, 80%, 50%, 0.05)',
                    border: '1px solid hsla(145, 80%, 50%, 0.2)',
                    borderRadius: '8px',
                  }}>
                    <CheckCircle2 size={18} color="var(--neon-emerald)" />
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      Excellent. We verified all energy charges, multipliers, and demand penalties. All statements align with regional tariff sheet parameters.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            {auditResult.has_discrepancies && (
              <div style={{ display: 'flex', gap: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', alignSelf: 'center' }}>
                  Actions for anomalies:
                </div>
                {auditResult.potential_savings > 0 && (
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      Please go to the <strong>Dispute Reports</strong> or <strong>Audit History</strong> tab to download a formal dispute letter citing these overbillings.
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

// Helper check
function tariffHasDemand(provider: string) {
  return provider !== 'us-pge-residential';
}

export default BillAuditor;
