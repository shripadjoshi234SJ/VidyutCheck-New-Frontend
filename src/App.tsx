import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import BillAuditor from './components/BillAuditor';
import AuditHistory from './components/AuditHistory';
import DisputeReports from './components/DisputeReports';
import Settings from './components/Settings';
import AuthModal from './components/AuthModal';
import JarvisAssistant from './components/Jarvis/JarvisAssistant';
import { AuditRecord, UserSettings } from './types';
import { sampleBills } from './data/sampleBills';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [user, setUser] = useState<{ loggedIn: boolean; username: string } | null>(() => {
    const saved = localStorage.getItem('vidyutcheck_user');
    return saved ? JSON.parse(saved) : { loggedIn: true, username: 'Tony Stark' }; // Default logged in for premium demo
  });

  const [settings, setSettings] = useState<UserSettings>(() => {
    const saved = localStorage.getItem('vidyutcheck_settings');
    return saved ? JSON.parse(saved) : {
      gemini_api_key: '',
      groq_api_key: '',
      customer_name: 'Tony Stark',
      account_number: '9845-0982-12',
      service_address: 'Plot 42, MIDC Industrial Area, Andheri East, Mumbai, Maharashtra 400093',
      default_provider: 'in-msedcl-industrial',
    };
  });

  const [audits, setAudits] = useState<AuditRecord[]>([]);
  const [isBackendConnected, setIsBackendConnected] = useState<boolean>(false);

  // Sync state to localstorage
  useEffect(() => {
    localStorage.setItem('vidyutcheck_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('vidyutcheck_user', JSON.stringify(user));
  }, [user]);

  // Load audit history from local storage or pre-fill with audited samples on first load
  useEffect(() => {
    const saved = localStorage.getItem('vidyutcheck_audits');
    if (saved) {
      setAudits(JSON.parse(saved));
    } else {
      // Pre-seed some audits from sample bills to make the dashboard look stunning instantly
      const initialRecords: AuditRecord[] = [
        {
          id: "audit-1",
          date_audited: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          bill: sampleBills[0].bill,
          result: {
            plan_name: "MSEDCL - HT-I Industrial",
            currency: "₹",
            has_discrepancies: true,
            errors: [
              {
                type: "LOW_POWER_FACTOR_WARNING",
                severity: "warning",
                message: "Power Factor (0.82) is below threshold of 0.90. Installing capacitor banks would save approximately ₹28,900 in penalties per cycle.",
                disputed_amount: 0.0,
                actionable: true,
                suggestion: "Install 15 kVAR capacitor banks to correct power factor."
              }
            ],
            expected_charges: {
              energy_charge: 361250.00,
              demand_charge: 94500.00,
              fixed_charge: 500.00,
              taxes: 72990.00,
              surcharges: 25000.00,
              total: 554240.00
            },
            potential_savings: 28900.00
          }
        },
        {
          id: "audit-2",
          date_audited: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          bill: sampleBills[1].bill,
          result: {
            plan_name: "BESCOM - LT-3 Commercial",
            currency: "₹",
            has_discrepancies: true,
            errors: [
              {
                type: "ENERGY_CHARGE_ERROR",
                severity: "high",
                message: "Expected energy charge of ₹23040.00 (based on 3200 kWh * multiplier 1.0 * rate ₹7.20/kWh), but was billed ₹230400.00 due to multiplier 10.0 error.",
                disputed_amount: 207360.00
              }
            ],
            expected_charges: {
              energy_charge: 23040.00,
              demand_charge: 6160.00,
              fixed_charge: 150.00,
              taxes: 2637.90,
              surcharges: 0.00,
              total: 31987.90
            },
            potential_savings: 226026.00
          }
        }
      ];
      setAudits(initialRecords);
      localStorage.setItem('vidyutcheck_audits', JSON.stringify(initialRecords));
    }
  }, []);

  // Check connection to local FastAPI backend on load
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const response = await fetch('/api/tariffs');
        if (response.ok) {
          setIsBackendConnected(true);
        } else {
          setIsBackendConnected(false);
        }
      } catch (e) {
        setIsBackendConnected(false);
      }
    };
    checkConnection();
    const timer = setInterval(checkConnection, 10000);
    return () => clearInterval(timer);
  }, []);

  const addAuditRecord = (record: AuditRecord) => {
    const updated = [record, ...audits];
    setAudits(updated);
    localStorage.setItem('vidyutcheck_audits', JSON.stringify(updated));
  };

  const clearAuditHistory = () => {
    setAudits([]);
    localStorage.removeItem('vidyutcheck_audits');
  };

  const handleLoginSuccess = (username: string) => {
    setUser({ loggedIn: true, username });
    setSettings(prev => ({
      ...prev,
      customer_name: username
    }));
  };

  const handleLogout = () => {
    setUser({ loggedIn: false, username: '' });
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard audits={audits} setActiveTab={setActiveTab} />;
      case 'auditor':
        return (
          <BillAuditor
            settings={settings}
            onAuditComplete={addAuditRecord}
            isBackendConnected={isBackendConnected}
          />
        );
      case 'history':
        return <AuditHistory audits={audits} onClear={clearAuditHistory} />;
      case 'disputes':
        return <DisputeReports audits={audits} settings={settings} />;
      case 'settings':
        return <Settings settings={settings} setSettings={setSettings} />;
      default:
        return <Dashboard audits={audits} setActiveTab={setActiveTab} />;
    }
  };

  if (!user || !user.loggedIn) {
    return (
      <AuthModal
        isOpen={true}
        onClose={() => {}}
        onLoginSuccess={handleLoginSuccess}
        isFullScreen={true}
      />
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        onAuthClick={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
        isBackendConnected={isBackendConnected}
      />

      <main style={{ flex: 1, padding: '0 1.5rem 1.5rem 1.5rem', maxWidth: '1400px', width: '100%', margin: '0 auto' }}>
        <div className="tab-content">
          {renderContent()}
        </div>
      </main>

      <JarvisAssistant
        settings={settings}
        activeAudit={audits.length > 0 ? audits[0] : null}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
};

export default App;
