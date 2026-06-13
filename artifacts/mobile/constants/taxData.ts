export type IncomeType = "salaried" | "non_salaried" | "it_freelancer" | "agriculture";

export type ProfessionCategory =
  | "salaried_private"
  | "salaried_government"
  | "it_freelancer"
  | "freelancer_local"
  | "business_owner"
  | "doctor_medical"
  | "teacher_educator"
  | "farmer_agriculture"
  | "shop_trader"
  | "other";

export const PROFESSION_OPTIONS: {
  key: ProfessionCategory;
  emoji: string;
  label: string;
  description: string;
}[] = [
  { key: "salaried_private", emoji: "👔", label: "Salaried Employee", description: "Work for a company and receive monthly salary" },
  { key: "salaried_government", emoji: "🏛️", label: "Government Employee", description: "Federal or provincial government / military" },
  { key: "it_freelancer", emoji: "💻", label: "IT / Tech Freelancer", description: "Earn from foreign clients via software, digital, or IT services" },
  { key: "freelancer_local", emoji: "🔧", label: "Freelancer / Consultant", description: "Self-employed, local clients, consultancy" },
  { key: "business_owner", emoji: "🏪", label: "Business Owner", description: "Own and run a business" },
  { key: "doctor_medical", emoji: "🏥", label: "Doctor / Medical Professional", description: "Medical practice, clinic, or hospital" },
  { key: "teacher_educator", emoji: "📚", label: "Teacher / Educator", description: "School, college, or university teacher" },
  { key: "farmer_agriculture", emoji: "🌾", label: "Farmer / Agriculture", description: "Income from crops, livestock, or land" },
  { key: "shop_trader", emoji: "🛍️", label: "Shop Owner / Trader", description: "Retail shop, wholesale, or trade business" },
  { key: "other", emoji: "✏️", label: "Other", description: "Enter your profession below" },
];

export function getIncomeType(profession: ProfessionCategory): IncomeType {
  switch (profession) {
    case "salaried_private":
    case "salaried_government":
      return "salaried";
    case "it_freelancer":
      return "it_freelancer";
    case "farmer_agriculture":
      return "agriculture";
    default:
      return "non_salaried";
  }
}

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

export interface ApplicableLaw {
  title: string;
  section: string;
  explanation: string;
  isRelief: boolean;
}

export function getApplicableLaws(params: {
  incomeType: IncomeType;
  isWidow: boolean;
  isHeadOfHousehold: boolean;
  age: number;
  childrenUnder18: number;
  profession: ProfessionCategory;
}): ApplicableLaw[] {
  const laws: ApplicableLaw[] = [];

  if (params.age < 18) {
    laws.push({
      title: "Minor Person — Income Clubbing",
      section: "Section 87, Income Tax Ordinance 2001",
      explanation: "If you are under 18, your income is generally combined with your parents' income for tax purposes. You should not file taxes independently.",
      isRelief: false,
    });
  }

  if (params.incomeType === "salaried") {
    laws.push({
      title: "Salaried Person Tax Slabs",
      section: "Schedule I, Part I, Division I — Income Tax Ordinance 2001",
      explanation: "As a salaried person, your employer deducts income tax monthly from your salary (withholding tax). Your tax is calculated on annual taxable salary using the salaried person slabs, which offer lower rates than non-salaried persons.",
      isRelief: false,
    });
  }

  if (params.incomeType === "non_salaried") {
    laws.push({
      title: "Non-Salaried Person Tax Slabs",
      section: "Schedule I, Part I, Division II — Income Tax Ordinance 2001",
      explanation: "As a self-employed, business, or professional person, your income is taxed under non-salaried brackets. You are required to file your annual income tax return yourself by September 30 each year.",
      isRelief: false,
    });
  }

  if (params.incomeType === "it_freelancer") {
    laws.push({
      title: "IT Exports — Reduced Final Tax",
      section: "SRO 586(I)/2023 — Federal Board of Revenue",
      explanation: "Income received from abroad for IT and IT-enabled services (software, freelance tech, digital services) is subject to a final withholding tax of 0.25%. This is your total federal tax — no further income tax applies on this income.",
      isRelief: true,
    });
  }

  if (params.incomeType === "agriculture") {
    laws.push({
      title: "Agricultural Income — Federal Tax Exempt",
      section: "Section 41, Income Tax Ordinance 2001",
      explanation: "Income from agriculture (crops, orchards, livestock farmed on your land) is exempt from federal income tax. However, your province may levy Agricultural Income Tax separately. Consult your provincial tax authority (Punjab, Sindh, KP, or Balochistan).",
      isRelief: true,
    });
  }

  if (params.isWidow) {
    laws.push({
      title: "Widow Relief — 50% Tax Rebate",
      section: "Clause 1(A), Part III, Second Schedule — Income Tax Ordinance 2001",
      explanation: "As a widow, you are entitled to a 50% rebate on your computed income tax. This means your final tax payable is half of what it would normally be. This relief is available in every tax year as long as you remain a widow.",
      isRelief: true,
    });
  }

  if (params.isWidow && params.isHeadOfHousehold && params.childrenUnder18 > 0) {
    laws.push({
      title: "Head of Household with Minor Children",
      section: "Section 53 & Second Schedule — Income Tax Ordinance 2001",
      explanation: `As a widow who is the primary caregiver for ${params.childrenUnder18} minor child${params.childrenUnder18 > 1 ? "ren" : ""} under 18, you retain the 50% widow tax rebate. The income of your minor children (if any) may be clubbed with your income under Section 87. You are also advised to register as a taxpayer with FBR to access full benefits.`,
      isRelief: true,
    });
  }

  if (params.profession === "teacher_educator") {
    laws.push({
      title: "Teacher / Educator — Consult FBR for Rebates",
      section: "Finance Act — Income Tax Ordinance 2001",
      explanation: "Some tax rebates for full-time teachers were modified in recent Finance Acts. Consult FBR or a tax consultant to verify if any educator-specific rebate applies to your situation for tax year 2024–25.",
      isRelief: false,
    });
  }

  if (params.profession === "salaried_government") {
    laws.push({
      title: "Government Employee — Pension Exemption",
      section: "Clause 13, Part I, Second Schedule — ITO 2001",
      explanation: "Pension received by a retired government servant is exempt from income tax. Additionally, gratuity up to certain limits is also exempt. Only your active salary is subject to the salaried person tax slabs.",
      isRelief: true,
    });
  }

  laws.push({
    title: "Filing Deadline",
    section: "Section 114, Income Tax Ordinance 2001",
    explanation: "Your annual income tax return for the tax year 2024–25 (July 2024 – June 2025) must be filed by September 30, 2025. Filing late results in penalties. You can file online at iris.fbr.gov.pk.",
    isRelief: false,
  });

  return laws;
}

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
  isAgriculture: boolean;
  bracketBreakdown: { rate: number; amountInBracket: number; taxOnBracket: number }[];
}

export function calculateTaxes(
  grossIncome: number,
  incomeType: IncomeType,
  isWidow: boolean
): TaxResult {
  if (grossIncome <= 0 || incomeType === "agriculture") {
    return {
      grossIncome,
      incomeType,
      isWidow,
      taxBeforeRelief: 0,
      widowRelief: 0,
      finalTax: 0,
      effectiveRate: 0,
      marginalRate: 0,
      afterTaxIncome: grossIncome,
      isAgriculture: incomeType === "agriculture",
      bracketBreakdown: [],
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
      isAgriculture: false,
      bracketBreakdown: [{ rate: IT_FREELANCER_RATE, amountInBracket: grossIncome, taxOnBracket: finalTax }],
    };
  }

  const brackets = TAX_BRACKETS_2024[incomeType === "salaried" ? "salaried" : "non_salaried"];
  let tax = 0;
  let marginalRate = 0;
  const breakdown: TaxResult["bracketBreakdown"] = [];

  for (const bracket of brackets) {
    if (grossIncome <= bracket.min) break;
    const bracketMax = bracket.max ?? Infinity;

    if (bracket.rate === 0) {
      if (grossIncome <= bracketMax) { marginalRate = 0; break; }
      continue;
    }

    const amountInBracket = Math.min(grossIncome, bracketMax) - bracket.min;
    tax = bracket.fixedAmount + amountInBracket * bracket.rate;
    breakdown.push({ rate: bracket.rate, amountInBracket, taxOnBracket: amountInBracket * bracket.rate });
    marginalRate = bracket.rate;
    if (grossIncome <= bracketMax) break;
  }

  const taxBeforeRelief = Math.max(0, tax);
  const widowRelief = isWidow ? taxBeforeRelief * 0.5 : 0;
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
    isAgriculture: false,
    bracketBreakdown: breakdown,
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

export const TAX_YEAR = "2024–25";
