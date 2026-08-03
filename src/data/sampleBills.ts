import { BillInput } from '../types';

export interface SampleBillScenario {
  id: string;
  name: string;
  description: string;
  expectedDiscrepancy: string;
  bill: BillInput;
}

export const sampleBills: SampleBillScenario[] = [
  {
    id: "msedcl-industrial-lowpf",
    name: "MSEDCL Industrial Bill (Low Power Factor)",
    description: "Maharashtra heavy engineering unit. The plant runs heavy machinery with a low Power Factor of 0.82, triggering a utility PF surcharge penalty.",
    expectedDiscrepancy: "Power factor penalty alert and capacitor bank saving suggestion.",
    bill: {
      provider_id: "in-msedcl-industrial",
      billing_period: "July 2026",
      contracted_load: 250.0,
      peak_demand: 210.0,
      consumption: 42500.0,
      power_factor: 0.82,
      meter_multiplier: 1.0,
      reported_energy_charge: 361250.00,
      reported_demand_charge: 94500.00,
      reported_fixed_charge: 500.00,
      reported_taxes: 72990.00,
      reported_surcharges: 25000.00,
      reported_total: 554240.00
    }
  },
  {
    id: "bescom-multiplier-error",
    name: "BESCOM Commercial Bill (Multiplier Error)",
    description: "Bangalore tech park office. The meter multiplier constant was calculated incorrectly as 10.0 instead of 1.0, resulting in a massive overcharge.",
    expectedDiscrepancy: "High energy overcharge due to meter multiplier mismatch.",
    bill: {
      provider_id: "in-bescom-commercial",
      billing_period: "June 2026",
      contracted_load: 35.0,
      peak_demand: 28.0,
      consumption: 3200.0,
      power_factor: 0.89,
      meter_multiplier: 10.0,
      reported_energy_charge: 230400.00,
      reported_demand_charge: 6160.00,
      reported_fixed_charge: 150.00,
      reported_taxes: 21303.90,
      reported_surcharges: 0.00,
      reported_total: 258013.90
    }
  },
  {
    id: "tangedco-tax-error",
    name: "TANGEDCO Commercial Bill (Tax Overbilling)",
    description: "Chennai retail store. State utility taxes were calculated on a duplicated subtotal including non-taxable municipal riders.",
    expectedDiscrepancy: "Tax overcalculation mismatch.",
    bill: {
      provider_id: "in-tangedco-commercial",
      billing_period: "May 2026",
      contracted_load: 80.0,
      peak_demand: 65.0,
      consumption: 15000.0,
      power_factor: 0.94,
      meter_multiplier: 1.0,
      reported_energy_charge: 142500.00,
      reported_demand_charge: 22750.00,
      reported_fixed_charge: 300.00,
      reported_taxes: 28500.00,
      reported_surcharges: 5000.00,
      reported_total: 199050.00
    }
  },
  {
    id: "tpddl-clean-residential",
    name: "TPDDL Residential Bill (Clean Billing)",
    description: "Delhi apartment statement. Standard residential tariff billing according to TPDDL slab rates without any calculation errors.",
    expectedDiscrepancy: "No discrepancies found.",
    bill: {
      provider_id: "in-tpddl-residential",
      billing_period: "July 2026",
      contracted_load: 5.0,
      peak_demand: 3.8,
      consumption: 450.0,
      power_factor: 0.96,
      meter_multiplier: 1.0,
      reported_energy_charge: 2925.00,
      reported_demand_charge: 0.00,
      reported_fixed_charge: 125.00,
      reported_taxes: 152.50,
      reported_surcharges: 0.00,
      reported_total: 3202.50
    }
  }
];
