import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

import { IncomeType, TaxResult, calculateTaxes } from "@/constants/taxData";

const HISTORY_KEY = "@pk_tax_history";

export interface CalculationEntry {
  id: string;
  date: string;
  grossIncome: number;
  incomeType: IncomeType;
  isWidow: boolean;
  result: TaxResult;
}

interface TaxContextType {
  grossIncome: string;
  setGrossIncome: (v: string) => void;
  monthlyIncome: string;
  setMonthlyIncome: (v: string) => void;
  useMonthly: boolean;
  setUseMonthly: (v: boolean) => void;
  incomeType: IncomeType;
  setIncomeType: (v: IncomeType) => void;
  isWidow: boolean;
  setIsWidow: (v: boolean) => void;
  result: TaxResult | null;
  derivedAnnual: number;
  history: CalculationEntry[];
  saveToHistory: () => void;
  deleteHistory: (id: string) => void;
  clearHistory: () => void;
}

const TaxContext = createContext<TaxContextType | null>(null);

export function TaxProvider({ children }: { children: React.ReactNode }) {
  const [grossIncome, setGrossIncome] = useState<string>("");
  const [monthlyIncome, setMonthlyIncome] = useState<string>("");
  const [useMonthly, setUseMonthly] = useState<boolean>(false);
  const [incomeType, setIncomeType] = useState<IncomeType>("salaried");
  const [isWidow, setIsWidow] = useState<boolean>(false);
  const [history, setHistory] = useState<CalculationEntry[]>([]);

  useEffect(() => {
    AsyncStorage.getItem(HISTORY_KEY).then((raw) => {
      if (raw) {
        try { setHistory(JSON.parse(raw)); } catch {}
      }
    });
  }, []);

  const persistHistory = useCallback((entries: CalculationEntry[]) => {
    setHistory(entries);
    AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(entries));
  }, []);

  const annualFromMonthly = parseFloat(monthlyIncome.replace(/,/g, "")) * 12 || 0;
  const directAnnual = parseFloat(grossIncome.replace(/,/g, "")) || 0;
  const derivedAnnual = useMonthly ? annualFromMonthly : directAnnual;

  const result: TaxResult | null =
    derivedAnnual > 0
      ? calculateTaxes(derivedAnnual, incomeType, isWidow)
      : null;

  const saveToHistory = useCallback(() => {
    if (!result) return;
    const entry: CalculationEntry = {
      id: Date.now().toString() + Math.random().toString(36).substring(2, 7),
      date: new Date().toISOString(),
      grossIncome: derivedAnnual,
      incomeType,
      isWidow,
      result,
    };
    persistHistory([entry, ...history]);
  }, [result, derivedAnnual, incomeType, isWidow, history, persistHistory]);

  const deleteHistory = useCallback(
    (id: string) => persistHistory(history.filter((e) => e.id !== id)),
    [history, persistHistory]
  );

  const clearHistory = useCallback(() => persistHistory([]), [persistHistory]);

  return (
    <TaxContext.Provider
      value={{
        grossIncome, setGrossIncome,
        monthlyIncome, setMonthlyIncome,
        useMonthly, setUseMonthly,
        incomeType, setIncomeType,
        isWidow, setIsWidow,
        result, derivedAnnual,
        history, saveToHistory, deleteHistory, clearHistory,
      }}
    >
      {children}
    </TaxContext.Provider>
  );
}

export function useTax() {
  const ctx = useContext(TaxContext);
  if (!ctx) throw new Error("useTax must be used within TaxProvider");
  return ctx;
}
