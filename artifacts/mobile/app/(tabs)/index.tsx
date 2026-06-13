import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import colors from "@/constants/colors";
import { FILING_STATUS_LABELS, FilingStatus, STANDARD_DEDUCTIONS } from "@/constants/taxData";
import { useTax } from "@/context/TaxContext";
import { useColors } from "@/hooks/useColors";

const c = colors.light;

function formatCurrency(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

function formatPercent(n: number) {
  return (n * 100).toFixed(1) + "%";
}

const FILING_STATUSES: FilingStatus[] = ["single", "married_jointly", "head_of_household"];

export default function CalculatorScreen() {
  const insets = useSafeAreaInsets();
  const {
    grossIncome, setGrossIncome,
    filingStatus, setFilingStatus,
    useItemized, setUseItemized,
    itemizedAmount, setItemizedAmount,
    result,
    saveToHistory,
  } = useTax();
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    if (!result) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    saveToHistory();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleIncomeChange = (text: string) => {
    setSaved(false);
    const digits = text.replace(/[^0-9]/g, "");
    setGrossIncome(digits);
  };

  const displayIncome = grossIncome
    ? parseInt(grossIncome, 10).toLocaleString("en-US")
    : "";

  const webTop = Platform.OS === "web" ? 67 : insets.top;
  const webBottom = Platform.OS === "web" ? 34 : 0;

  return (
    <KeyboardAvoidingView
      style={[styles.flex, { backgroundColor: c.background }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: webTop + 16, paddingBottom: webBottom + 120 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.heading}>Tax Calculator</Text>
        <Text style={styles.subheading}>2024 Federal Tax Estimate</Text>

        <View style={styles.section}>
          <Text style={styles.label}>Gross Annual Income</Text>
          <View style={styles.inputRow}>
            <Text style={styles.currencySymbol}>$</Text>
            <TextInput
              style={styles.incomeInput}
              value={displayIncome}
              onChangeText={handleIncomeChange}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor={c.mutedForeground}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Filing Status</Text>
          <View style={styles.pills}>
            {FILING_STATUSES.map((status) => (
              <Pressable
                key={status}
                style={[
                  styles.pill,
                  filingStatus === status && styles.pillActive,
                ]}
                onPress={() => {
                  Haptics.selectionAsync();
                  setFilingStatus(status);
                  setSaved(false);
                }}
              >
                <Text
                  style={[
                    styles.pillText,
                    filingStatus === status && styles.pillTextActive,
                  ]}
                >
                  {FILING_STATUS_LABELS[status]}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.row}>
            <View style={styles.flex}>
              <Text style={styles.label}>Use Itemized Deduction</Text>
              <Text style={styles.hint}>
                Standard: {formatCurrency(STANDARD_DEDUCTIONS[filingStatus])}
              </Text>
            </View>
            <Switch
              value={useItemized}
              onValueChange={(v) => {
                Haptics.selectionAsync();
                setUseItemized(v);
                setSaved(false);
              }}
              trackColor={{ false: c.border, true: c.primary }}
              thumbColor={"#FFFFFF"}
            />
          </View>
          {useItemized && (
            <View style={[styles.inputRow, { marginTop: 10 }]}>
              <Text style={styles.currencySymbol}>$</Text>
              <TextInput
                style={styles.incomeInput}
                value={itemizedAmount}
                onChangeText={(t) => {
                  setItemizedAmount(t.replace(/[^0-9]/g, ""));
                  setSaved(false);
                }}
                keyboardType="numeric"
                placeholder="Enter itemized amount"
                placeholderTextColor={c.mutedForeground}
              />
            </View>
          )}
        </View>

        {result && (
          <>
            <View style={styles.resultCard}>
              <Text style={styles.resultTitle}>Estimated Tax Breakdown</Text>

              <View style={styles.resultMain}>
                <Text style={styles.totalTaxLabel}>Total Tax</Text>
                <Text style={styles.totalTaxAmount}>{formatCurrency(result.totalTax)}</Text>
                <View style={styles.rateRow}>
                  <View style={styles.rateChip}>
                    <Text style={styles.rateChipText}>
                      {formatPercent(result.effectiveRate)} effective
                    </Text>
                  </View>
                  <View style={[styles.rateChip, styles.rateChipSecondary]}>
                    <Text style={[styles.rateChipText, styles.rateChipTextSecondary]}>
                      {formatPercent(result.marginalRate)} marginal
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.breakdown}>
                <ResultRow label="Taxable Income" value={formatCurrency(result.taxableIncome)} />
                <ResultRow label="Deduction Used" value={formatCurrency(result.deductionUsed)} />
              </View>

              <View style={styles.divider} />

              <View style={styles.breakdown}>
                <ResultRow label="Federal Income Tax" value={formatCurrency(result.federalTax)} />
                <ResultRow label="Social Security (6.2%)" value={formatCurrency(result.socialSecurityTax)} />
                <ResultRow label="Medicare (1.45%+)" value={formatCurrency(result.medicareTax)} />
              </View>

              <View style={styles.divider} />

              <View style={styles.takeHomeRow}>
                <Text style={styles.takeHomeLabel}>Est. Take-Home</Text>
                <Text style={styles.takeHomeValue}>{formatCurrency(result.afterTaxIncome)}</Text>
              </View>
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.saveBtn,
                pressed && styles.saveBtnPressed,
                saved && styles.saveBtnSaved,
              ]}
              onPress={handleSave}
            >
              <Feather
                name={saved ? "check" : "bookmark"}
                size={16}
                color={saved ? c.success : c.primary}
              />
              <Text style={[styles.saveBtnText, saved && styles.saveBtnTextSaved]}>
                {saved ? "Saved to History" : "Save Calculation"}
              </Text>
            </Pressable>
          </>
        )}

        {!result && (
          <View style={styles.emptyState}>
            <Feather name="dollar-sign" size={40} color={c.border} />
            <Text style={styles.emptyTitle}>Enter your income</Text>
            <Text style={styles.emptyText}>
              Your tax breakdown will appear here
            </Text>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function ResultRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.resultRow}>
      <Text style={styles.resultRowLabel}>{label}</Text>
      <Text style={styles.resultRowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: { paddingHorizontal: 20 },
  heading: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    color: c.foreground,
    marginBottom: 4,
  },
  subheading: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: c.mutedForeground,
    marginBottom: 28,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: c.mutedForeground,
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  hint: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: c.mutedForeground,
    marginTop: 2,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: c.border,
    borderRadius: colors.radius,
    paddingHorizontal: 14,
    backgroundColor: c.card,
    height: 52,
  },
  currencySymbol: {
    fontSize: 20,
    fontFamily: "Inter_500Medium",
    color: c.mutedForeground,
    marginRight: 6,
  },
  incomeInput: {
    flex: 1,
    fontSize: 22,
    fontFamily: "Inter_600SemiBold",
    color: c.foreground,
  },
  pills: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  pill: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 100,
    borderWidth: 1.5,
    borderColor: c.border,
    backgroundColor: c.background,
  },
  pillActive: {
    backgroundColor: c.secondary,
    borderColor: c.primary,
  },
  pillText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: c.mutedForeground,
  },
  pillTextActive: {
    color: c.primary,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  resultCard: {
    backgroundColor: c.card,
    borderRadius: colors.radius + 4,
    borderWidth: 1,
    borderColor: c.border,
    padding: 20,
    marginBottom: 16,
  },
  resultTitle: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: c.mutedForeground,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 16,
  },
  resultMain: {
    alignItems: "center",
    marginBottom: 16,
  },
  totalTaxLabel: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: c.mutedForeground,
    marginBottom: 4,
  },
  totalTaxAmount: {
    fontSize: 40,
    fontFamily: "Inter_700Bold",
    color: c.foreground,
    marginBottom: 10,
  },
  rateRow: {
    flexDirection: "row",
    gap: 8,
  },
  rateChip: {
    backgroundColor: c.secondary,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 100,
  },
  rateChipSecondary: {
    backgroundColor: c.muted,
  },
  rateChipText: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    color: c.primary,
  },
  rateChipTextSecondary: {
    color: c.mutedForeground,
  },
  divider: {
    height: 1,
    backgroundColor: c.border,
    marginVertical: 12,
  },
  breakdown: {
    gap: 8,
  },
  resultRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  resultRowLabel: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: c.mutedForeground,
  },
  resultRowValue: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: c.foreground,
  },
  takeHomeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  takeHomeLabel: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: c.foreground,
  },
  takeHomeValue: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    color: c.accent,
  },
  saveBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 48,
    borderRadius: colors.radius,
    borderWidth: 1.5,
    borderColor: c.primary,
    backgroundColor: c.background,
    marginBottom: 8,
  },
  saveBtnPressed: {
    opacity: 0.7,
  },
  saveBtnSaved: {
    borderColor: c.success,
    backgroundColor: c.successLight,
  },
  saveBtnText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: c.primary,
  },
  saveBtnTextSaved: {
    color: c.success,
  },
  emptyState: {
    alignItems: "center",
    paddingTop: 60,
    gap: 10,
  },
  emptyTitle: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: c.mutedForeground,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: c.mutedForeground,
    textAlign: "center",
  },
});
