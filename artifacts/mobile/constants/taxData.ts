export type IncomeType = "salaried" | "non_salaried" | "it_freelancer";

export const INCOME_TYPE_LABELS: Record<IncomeType, string> = {
  salaried: "Salaried Employee",
  non_salaried: "Freelancer / Business",
  it_freelancer: "IT Freelancer (Foreign Income)",
};

export const INCOME_TYPE_DESCRIPTIONS: Record<IncomeType, string> = {
  salaried: "Earn a regular monthly salary from an employer",
  non_salaried: "Self-employed, business owner, or local freelancer",
  it_freelancer: "Earn from foreign clients via IT/digital services",
};

export interface TaxBracket {
  min: number;
  max: number | null;
  rate: number;
  fixedAmount: number;
}

export const TAX_BRACKETS_2024: Record<"salaried" | "non_salaried", TaxBracket[]> = {
  salaried: [
    { min: 0, max: 600000, rate: 0.00, fixedAmount: 0 },
    { min: 600000, max: 1200000, rate: 0.05, fixedAmount: 0 },
    { min: 1200000, max: 2200000, rate: 0.15, fixedAmount: 30000 },
    { min: 2200000, max: 3200000, rate: 0.25, fixedAmount: 180000 },
    { min: 3200000, max: 4100000, rate: 0.30, fixedAmount: 430000 },
    { min: 4100000, max: null, rate: 0.35, fixedAmount: 700000 },
  ],
  non_salaried: [
    { min: 0, max: 600000, rate: 0.00, fixedAmount: 0 },
    { min: 600000, max: 1200000, rate: 0.15, fixedAmount: 0 },
    { min: 1200000, max: 2400000, rate: 0.20, fixedAmount: 90000 },
    { min: 2400000, max: 3600000, rate: 0.25, fixedAmount: 330000 },
    { min: 3600000, max: 6000000, rate: 0.30, fixedAmount: 630000 },
    { min: 6000000, max: null, rate: 0.35, fixedAmount: 1350000 },
  ],
};

export const IT_FREELANCER_RATE = 0.0025;
export const WIDOW_RELIEF_RATE = 0.50;

export interface TaxResult {
  grossIncome: number;
  incomeType: IncomeType;
  isWidow: boolean;
  taxBeforeRelief: number;
  widowRelief: number;
  finalTax: number;
  effectiveRate: number;
  marginalRate: number;
  afterTaxIncome: number;
  bracketBreakdown: {
    rate: number;
    amountInBracket: number;
    taxOnBracket: number;
  }[];
  isITFreelancer: boolean;
}

function computeSlabTax(income: number, brackets: TaxBracket[]): {
  tax: number;
  marginalRate: number;
  breakdown: TaxResult["bracketBreakdown"];
} {
  let tax = 0;
  let marginalRate = 0;
  const breakdown: TaxResult["bracketBreakdown"] = [];

  for (const bracket of brackets) {
    if (income <= bracket.min) break;
    const bracketMax = bracket.max ?? Infinity;
    const amountInBracket = Math.min(income, bracketMax) - bracket.min;
    const taxOnBracket =
      bracket.rate === 0
        ? 0
        : bracket.fixedAmount > 0
        ? bracket.fixedAmount + (amountInBracket * bracket.rate)
        : amountInBracket * bracket.rate;

    if (bracket.rate > 0) {
      const lastBracketTax =
        breakdown.length > 0
          ? breakdown[breakdown.length - 1].taxOnBracket
          : 0;
      breakdown.push({
        rate: bracket.rate,
        amountInBracket,
        taxOnBracket: bracket.fixedAmount > 0
          ? bracket.fixedAmount + amountInBracket * bracket.rate - (tax)
          : amountInBracket * bracket.rate,
      });
    }
    if (bracket.rate > 0) {
      tax = bracket.fixedAmount + (Math.min(income, bracketMax) - bracket.min) * bracket.rate;
    }
    if (income <= bracketMax) {
      marginalRate = bracket.rate;
      break;
    }
    marginalRate = bracket.rate;
  }

  return { tax: Math.max(0, tax), marginalRate, breakdown };
}

export function calculateTaxes(
  grossIncome: number,
  incomeType: IncomeType,
  isWidow: boolean
): TaxResult {
  if (grossIncome <= 0) {
    return {
      grossIncome: 0,
      incomeType,
      isWidow,
      taxBeforeRelief: 0,
      widowRelief: 0,
      finalTax: 0,
      effectiveRate: 0,
      marginalRate: 0,
      afterTaxIncome: 0,
      bracketBreakdown: [],
      isITFreelancer: incomeType === "it_freelancer",
    };
  }

  if (incomeType === "it_freelancer") {
    const finalTax = grossIncome * IT_FREELANCER_RATE;
    return {
      grossIncome,
      incomeType,
      isWidow,
      taxBeforeRelief: finalTax,
      widowRelief: 0,
      finalTax,
      effectiveRate: IT_FREELANCER_RATE,
      marginalRate: IT_FREELANCER_RATE,
      afterTaxIncome: grossIncome - finalTax,
      bracketBreakdown: [
        { rate: IT_FREELANCER_RATE, amountInBracket: grossIncome, taxOnBracket: finalTax },
      ],
      isITFreelancer: true,
    };
  }

  const brackets =
    TAX_BRACKETS_2024[incomeType === "salaried" ? "salaried" : "non_salaried"];

  let tax = 0;
  let marginalRate = 0;
  const breakdown: TaxResult["bracketBreakdown"] = [];

  for (let i = 0; i < brackets.length; i++) {
    const bracket = brackets[i];
    if (grossIncome <= bracket.min) break;
    const bracketMax = bracket.max ?? Infinity;

    if (bracket.rate === 0) {
      if (grossIncome <= bracketMax) {
        marginalRate = 0;
        break;
      }
      continue;
    }

    const amountInBracket = Math.min(grossIncome, bracketMax) - bracket.min;
    tax = bracket.fixedAmount + amountInBracket * bracket.rate;
    const taxOnBracket = amountInBracket * bracket.rate;

    breakdown.push({ rate: bracket.rate, amountInBracket, taxOnBracket });
    marginalRate = bracket.rate;

    if (grossIncome <= bracketMax) break;
  }

  const taxBeforeRelief = Math.max(0, tax);
  const widowRelief = isWidow ? taxBeforeRelief * WIDOW_RELIEF_RATE : 0;
  const finalTax = Math.max(0, taxBeforeRelief - widowRelief);

  return {
    grossIncome,
    incomeType,
    isWidow,
    taxBeforeRelief,
    widowRelief,
    finalTax,
    effectiveRate: grossIncome > 0 ? finalTax / grossIncome : 0,
    marginalRate,
    afterTaxIncome: grossIncome - finalTax,
    bracketBreakdown: breakdown,
    isITFreelancer: false,
  };
}

export const BRACKET_COLORS: Record<number, string> = {
  0.00: "#D1FAE5",
  0.05: "#A7F3D0",
  0.15: "#6EE7B7",
  0.20: "#FCD34D",
  0.25: "#FBBF24",
  0.30: "#FB923C",
  0.35: "#EF4444",
  0.0025: "#A7F3D0",
};

export const INCOME_GUIDE_QUESTIONS = [
  {
    id: "daily_worker",
    question: "Do you work daily or weekly and get paid in cash?",
    hint: "e.g., shop owner, daily wage worker",
    multiplier: { daily: 365, weekly: 52 },
  },
  {
    id: "monthly_salary",
    question: "What is your monthly salary or earnings?",
    hint: "We will calculate your annual income",
    multiplier: 12,
  },
];

export const TAX_YEAR = "2024–25";
export const TAX_AUTHORITY = "FBR (Federal Board of Revenue)";
