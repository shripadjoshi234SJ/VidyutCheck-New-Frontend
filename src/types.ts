export interface BillInput {
  provider_id: string;
  billing_period: string;
  contracted_load: number; // in kW or kVA
  peak_demand: number; // in kW or kVA
  consumption: number; // in kWh
  power_factor: number; // 0.0 - 1.0
  meter_multiplier: number; // e.g. 1.0 or 10.0 or 80.0
  reported_energy_charge: number;
  reported_demand_charge: number;
  reported_fixed_charge: number;
  reported_taxes: number;
  reported_surcharges: number;
  reported_total: number;
}

export interface BillingError {
  type: string;
  severity: 'low' | 'warning' | 'medium' | 'high';
  message: string;
  disputed_amount: number;
  actionable?: boolean;
  suggestion?: string;
}

export interface ExpectedCharges {
  energy_charge: number;
  demand_charge: number;
  fixed_charge: number;
  taxes: number;
  surcharges: number;
  total: number;
}

export interface AuditResult {
  plan_name: string;
  currency: string;
  has_discrepancies: boolean;
  errors: BillingError[];
  expected_charges: ExpectedCharges;
  potential_savings: number;
}

export interface ChatMessage {
  role: 'user' | 'model';
  parts: string;
}

export interface UserSettings {
  gemini_api_key: string;
  grok_api_key?: string;
  customer_name: string;
  account_number: string;
  service_address: string;
  default_provider: string;
}

export interface DisputeReport {
  id: string;
  customer_name: string;
  account_number: string;
  service_address: string;
  utility_provider: string;
  billing_period: string;
  disputed_amount: number;
  currency: string;
  findings: string[];
  generated_letter: string;
  status: 'Draft' | 'Sent' | 'Resolved';
  date_created: string;
}

export interface AuditRecord {
  id: string;
  bill: BillInput;
  result: AuditResult;
  date_audited: string;
}
