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
    id: "coned-erroneous-commercial",
    name: "NY ConEd Commercial Bill (Billing Error)",
    description: "New York retail shop. Billed energy charges are higher than the published EL2 commercial tariff rate, and taxes were calculated on a duplicate total subtotal.",
    expectedDiscrepancy: "Energy calculation mismatch and duplicate tax billing.",
    bill: {
      provider_id: "us-coned-commercial",
      billing_period: "June 2026",
      contracted_load: 60.0,
      peak_demand: 45.0,
      consumption: 12000.0,
      power_factor: 0.92,
      meter_multiplier: 1.0,
      reported_energy_charge: 2560.00,
      reported_demand_charge: 832.50,
      reported_fixed_charge: 25.00,
      reported_taxes: 420.50,
      reported_surcharges: 120.00,
      reported_total: 3958.00
    }
  },
  {
    id: "msedcl-industrial-lowpf",
    name: "MSEDCL Industrial Bill (Low Power Factor)",
    description: "Maharashtra heavy engineering unit. The plant runs heavy machinery with a low Power Factor of 0.82, triggering a utility PF surcharge. Also features a meter multiplier of 80.0.",
    expectedDiscrepancy: "Power factor penalty alert and capacitor bank saving suggestion.",
    bill: {
      provider_id: "in-msedcl-industrial",
      billing_period: "May 2026",
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
    id: "pge-clean-residential",
    name: "CA PG&E Residential Bill (Correct Billing)",
    description: "San Francisco apartment. Standard energy billing based on PG&E E-1 rate without any discrepancies or billing anomalies.",
    expectedDiscrepancy: "No discrepancies found.",
    bill: {
      provider_id: "us-pge-residential",
      billing_period: "July 2026",
      contracted_load: 10.0,
      peak_demand: 4.2,
      consumption: 480.0,
      power_factor: 0.98,
      meter_multiplier: 1.0,
      reported_energy_charge: 153.60,
      reported_demand_charge: 0.00,
      reported_fixed_charge: 10.00,
      reported_taxes: 13.09,
      reported_surcharges: 0.00,
      reported_total: 176.69
    }
  },
  {
    id: "bescom-multiplier-error",
    name: "BESCOM Commercial Bill (Multiplier Error)",
    description: "Bangalore office building. The meter multiplier was calculated incorrectly as 10.0 instead of the documented 1.0, resulting in a 10x overcharge on energy consumption.",
    expectedDiscrepancy: "High energy overcharge due to meter multiplier mismatch.",
    bill: {
      provider_id: "in-bescom-commercial",
      billing_period: "April 2026",
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
  }
];
