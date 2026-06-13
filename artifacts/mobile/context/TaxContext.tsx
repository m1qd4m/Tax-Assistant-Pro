import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

import { FilingStatus, TaxResult, calculateTaxes } from "@/constants/taxData";

const HISTORY_KEY = "@tax_history";

export interface CalculationEntry {
  id: string;
  date: string;
  grossIncome: number;
  filingStatus: FilingStatus;
  useItemized: boolean;
  itemizedAmount: number;
  result: TaxResult;
}

interface TaxContextType {
  grossIncome: string;
  setGrossIncome: (v: string) => void;
  filingStatus: FilingStatus;
  setFilingStatus: (v: FilingStatus) => void;
  useItemized: boolean;
  setUseItemized: (v: boolean) => void;
  itemizedAmount: string;
  setItemizedAmount: (v: string) => void;
  result: TaxResult | null;
  history: CalculationEntry[];
  saveToHistory: () => void;
  deleteHistory: (id: string) => void;
  clearHistory: () => void;
}

const TaxContext = createContext<TaxContextType | null>(null);

export function TaxProvider({ children }: { children: React.ReactNode }) {
  const [grossIncome, setGrossIncome] = useState<string>("");
  const [filingStatus, setFilingStatus] = useState<FilingStatus>("single");
  const [useItemized, setUseItemized] = useState<boolean>(false);
  const [itemizedAmount, setItemizedAmount] = useState<string>("");
  const [history, setHistory] = useState<CalculationEntry[]>([]);

  useEffect(() => {
    AsyncStorage.getItem(HISTORY_KEY).then((raw) => {
      if (raw) {
        try {
          setHistory(JSON.parse(raw));
        } catch {}
      }
    });
  }, []);

  const persistHistory = useCallback((entries: CalculationEntry[]) => {
    setHistory(entries);
    AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(entries));
  }, []);

  const income = parseFloat(grossIncome.replace(/,/g, "")) || 0;
  const itemized = parseFloat(itemizedAmount.replace(/,/g, "")) || 0;

  const result: TaxResult | null =
    income > 0 ? calculateTaxes(income, filingStatus, useItemized, itemized) : null;

  const saveToHistory = useCallback(() => {
    if (!result) return;
    const entry: CalculationEntry = {
      id: Date.now().toString() + Math.random().toString(36).substring(2, 7),
      date: new Date().toISOString(),
      grossIncome: income,
      filingStatus,
      useItemized,
      itemizedAmount: itemized,
      result,
    };
    persistHistory([entry, ...history]);
  }, [result, income, filingStatus, useItemized, itemized, history, persistHistory]);

  const deleteHistory = useCallback(
    (id: string) => {
      persistHistory(history.filter((e) => e.id !== id));
    },
    [history, persistHistory]
  );

  const clearHistory = useCallback(() => {
    persistHistory([]);
  }, [persistHistory]);

  return (
    <TaxContext.Provider
      value={{
        grossIncome,
        setGrossIncome,
        filingStatus,
        setFilingStatus,
        useItemized,
        setUseItemized,
        itemizedAmount,
        setItemizedAmount,
        result,
        history,
        saveToHistory,
        deleteHistory,
        clearHistory,
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
