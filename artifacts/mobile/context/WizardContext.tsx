import React, { createContext, useCallback, useContext, useState } from "react";

import {
  ProfessionCategory,
  TaxResult,
  calculateTaxes,
  getApplicableLaws,
  getIncomeType,
  ApplicableLaw,
} from "@/constants/taxData";

export type Gender = "male" | "female" | "other" | "";
export type MaritalStatus = "married" | "single" | "widow" | "divorced" | "";

export interface WizardState {
  name: string;
  gender: Gender;
  age: string;
  maritalStatus: MaritalStatus;
  isHeadOfHousehold: boolean;
  childrenUnder18: string;
  professionCategory: ProfessionCategory | "";
  professionOther: string;
  annualIncome: string;
  monthlyIncome: string;
  useMonthly: boolean;
}

interface WizardContextType extends WizardState {
  setName: (v: string) => void;
  setGender: (v: Gender) => void;
  setAge: (v: string) => void;
  setMaritalStatus: (v: MaritalStatus) => void;
  setIsHeadOfHousehold: (v: boolean) => void;
  setChildrenUnder18: (v: string) => void;
  setProfessionCategory: (v: ProfessionCategory | "") => void;
  setProfessionOther: (v: string) => void;
  setAnnualIncome: (v: string) => void;
  setMonthlyIncome: (v: string) => void;
  setUseMonthly: (v: boolean) => void;
  derivedAnnual: number;
  result: TaxResult | null;
  laws: ApplicableLaw[];
  isWidow: boolean;
  resetWizard: () => void;
}

const defaultState: WizardState = {
  name: "",
  gender: "",
  age: "",
  maritalStatus: "",
  isHeadOfHousehold: false,
  childrenUnder18: "",
  professionCategory: "",
  professionOther: "",
  annualIncome: "",
  monthlyIncome: "",
  useMonthly: false,
};

const WizardContext = createContext<WizardContextType | null>(null);

export function WizardProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<WizardState>(defaultState);

  const update = <K extends keyof WizardState>(key: K) => (val: WizardState[K]) =>
    setState((s) => ({ ...s, [key]: val }));

  const annualFromMonthly = (parseFloat(state.monthlyIncome.replace(/,/g, "")) || 0) * 12;
  const directAnnual = parseFloat(state.annualIncome.replace(/,/g, "")) || 0;
  const derivedAnnual = state.useMonthly ? annualFromMonthly : directAnnual;

  const isWidow =
    state.maritalStatus === "widow" && (state.gender === "female" || state.gender === "other");

  const incomeType =
    state.professionCategory ? getIncomeType(state.professionCategory as ProfessionCategory) : "salaried";

  const result: TaxResult | null =
    derivedAnnual > 0 && state.professionCategory
      ? calculateTaxes(derivedAnnual, incomeType, isWidow)
      : null;

  const laws: ApplicableLaw[] =
    state.professionCategory
      ? getApplicableLaws({
          incomeType,
          isWidow,
          isHeadOfHousehold: state.isHeadOfHousehold,
          age: parseInt(state.age, 10) || 25,
          childrenUnder18: parseInt(state.childrenUnder18, 10) || 0,
          profession: state.professionCategory as ProfessionCategory,
        })
      : [];

  const resetWizard = useCallback(() => setState(defaultState), []);

  return (
    <WizardContext.Provider
      value={{
        ...state,
        setName: update("name"),
        setGender: update("gender"),
        setAge: update("age"),
        setMaritalStatus: update("maritalStatus"),
        setIsHeadOfHousehold: update("isHeadOfHousehold"),
        setChildrenUnder18: update("childrenUnder18"),
        setProfessionCategory: update("professionCategory"),
        setProfessionOther: update("professionOther"),
        setAnnualIncome: update("annualIncome"),
        setMonthlyIncome: update("monthlyIncome"),
        setUseMonthly: update("useMonthly"),
        derivedAnnual,
        result,
        laws,
        isWidow,
        resetWizard,
      }}
    >
      {children}
    </WizardContext.Provider>
  );
}

export function useWizard() {
  const ctx = useContext(WizardContext);
  if (!ctx) throw new Error("useWizard must be within WizardProvider");
  return ctx;
}
