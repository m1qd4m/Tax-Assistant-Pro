export type FilingStatus = "single" | "married_jointly" | "head_of_household";

export interface TaxBracket {
  min: number;
  max: number | null;
  rate: number;
}

export const FILING_STATUS_LABELS: Record<FilingStatus, string> = {
  single: "Single",
  married_jointly: "Married Filing Jointly",
  head_of_household: "Head of Household",
};

export const STANDARD_DEDUCTIONS: Record<FilingStatus, number> = {
  single: 14600,
  married_jointly: 29200,
  head_of_household: 21900,
};

export const TAX_BRACKETS_2024: Record<FilingStatus, TaxBracket[]> = {
  single: [
    { min: 0, max: 11600, rate: 0.10 },
    { min: 11600, max: 47150, rate: 0.12 },
    { min: 47150, max: 100525, rate: 0.22 },
    { min: 100525, max: 191950, rate: 0.24 },
    { min: 191950, max: 243725, rate: 0.32 },
    { min: 243725, max: 609350, rate: 0.35 },
    { min: 609350, max: null, rate: 0.37 },
  ],
  married_jointly: [
    { min: 0, max: 23200, rate: 0.10 },
    { min: 23200, max: 94300, rate: 0.12 },
    { min: 94300, max: 201050, rate: 0.22 },
    { min: 201050, max: 383900, rate: 0.24 },
    { min: 383900, max: 487450, rate: 0.32 },
    { min: 487450, max: 731200, rate: 0.35 },
    { min: 731200, max: null, rate: 0.37 },
  ],
  head_of_household: [
    { min: 0, max: 16550, rate: 0.10 },
    { min: 16550, max: 63100, rate: 0.12 },
    { min: 63100, max: 100500, rate: 0.22 },
    { min: 100500, max: 191950, rate: 0.24 },
    { min: 191950, max: 243700, rate: 0.32 },
    { min: 243700, max: 609350, rate: 0.35 },
    { min: 609350, max: null, rate: 0.37 },
  ],
};

export const SS_WAGE_BASE_2024 = 168600;
export const SS_RATE = 0.062;
export const MEDICARE_RATE = 0.0145;
export const ADDITIONAL_MEDICARE_RATE = 0.009;
export const ADDITIONAL_MEDICARE_THRESHOLD: Record<FilingStatus, number> = {
  single: 200000,
  married_jointly: 250000,
  head_of_household: 200000,
};

export interface TaxResult {
  grossIncome: number;
  standardDeduction: number;
  itemizedDeduction: number;
  deductionUsed: number;
  taxableIncome: number;
  federalTax: number;
  socialSecurityTax: number;
  medicareTax: number;
  totalTax: number;
  effectiveRate: number;
  marginalRate: number;
  afterTaxIncome: number;
  bracketBreakdown: { rate: number; amount: number; taxOnBracket: number }[];
}

export function calculateTaxes(
  grossIncome: number,
  filingStatus: FilingStatus,
  useItemized: boolean,
  itemizedAmount: number
): TaxResult {
  const standardDeduction = STANDARD_DEDUCTIONS[filingStatus];
  const deductionUsed = useItemized
    ? Math.max(itemizedAmount, 0)
    : standardDeduction;
  const taxableIncome = Math.max(0, grossIncome - deductionUsed);

  const brackets = TAX_BRACKETS_2024[filingStatus];
  let federalTax = 0;
  let marginalRate = 0.10;
  const bracketBreakdown: TaxResult["bracketBreakdown"] = [];

  for (const bracket of brackets) {
    if (taxableIncome <= bracket.min) break;
    const bracketMax = bracket.max ?? Infinity;
    const amountInBracket = Math.min(taxableIncome, bracketMax) - bracket.min;
    const taxOnBracket = amountInBracket * bracket.rate;
    federalTax += taxOnBracket;
    marginalRate = bracket.rate;
    bracketBreakdown.push({
      rate: bracket.rate,
      amount: amountInBracket,
      taxOnBracket,
    });
  }

  const ssWages = Math.min(grossIncome, SS_WAGE_BASE_2024);
  const socialSecurityTax = ssWages * SS_RATE;

  const additionalMedicareThreshold = ADDITIONAL_MEDICARE_THRESHOLD[filingStatus];
  const baseMedicareTax = grossIncome * MEDICARE_RATE;
  const additionalMedicareTax =
    Math.max(0, grossIncome - additionalMedicareThreshold) * ADDITIONAL_MEDICARE_RATE;
  const medicareTax = baseMedicareTax + additionalMedicareTax;

  const totalTax = federalTax + socialSecurityTax + medicareTax;
  const effectiveRate = grossIncome > 0 ? totalTax / grossIncome : 0;
  const afterTaxIncome = grossIncome - totalTax;

  return {
    grossIncome,
    standardDeduction,
    itemizedDeduction: itemizedAmount,
    deductionUsed,
    taxableIncome,
    federalTax,
    socialSecurityTax,
    medicareTax,
    totalTax,
    effectiveRate,
    marginalRate,
    afterTaxIncome,
    bracketBreakdown,
  };
}

export const BRACKET_COLORS: Record<number, string> = {
  0.10: "#6EE7B7",
  0.12: "#34D399",
  0.22: "#FCD34D",
  0.24: "#FBBF24",
  0.32: "#FB923C",
  0.35: "#F87171",
  0.37: "#EF4444",
};
