import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { WizardShell } from "@/components/WizardShell";
import colors from "@/constants/colors";
import { useWizard } from "@/context/WizardContext";

const c = colors.light;

function formatDisplay(raw: string) {
  const n = parseInt(raw.replace(/,/g, ""), 10);
  if (isNaN(n)) return "";
  return n.toLocaleString("en-US");
}

function formatPKR(n: number) {
  if (n >= 10000000) return "₨ " + (n / 10000000).toFixed(2) + " Crore";
  if (n >= 100000) return "₨ " + (n / 100000).toFixed(1) + " Lac";
  return "₨ " + n.toLocaleString("en-US");
}

export default function IncomeScreen() {
  const {
    name,
    annualIncome, setAnnualIncome,
    monthlyIncome, setMonthlyIncome,
    useMonthly, setUseMonthly,
    derivedAnnual,
  } = useWizard();

  const canContinue = derivedAnnual > 0;

  const handleChange = (text: string, setter: (v: string) => void) => {
    setter(text.replace(/[^0-9]/g, ""));
  };

  return (
    <WizardShell
      step={4}
      title={`${name ? name.split(" ")[0] + ", how" : "How"} much do you earn?`}
      subtitle="Enter your income before any deductions or taxes."
      canContinue={canContinue}
      onContinue={() => router.push("/wizard/5-results")}
      continueLabel="Calculate My Tax"
    >
      {/* Toggle */}
      <View style={styles.toggle}>
        <Pressable
          style={[styles.toggleBtn, !useMonthly && styles.toggleBtnActive]}
          onPress={() => { Haptics.selectionAsync(); setUseMonthly(false); }}
        >
          <Text style={[styles.toggleText, !useMonthly && styles.toggleTextActive]}>
            I know my annual income
          </Text>
        </Pressable>
        <Pressable
          style={[styles.toggleBtn, useMonthly && styles.toggleBtnActive]}
          onPress={() => { Haptics.selectionAsync(); setUseMonthly(true); }}
        >
          <Text style={[styles.toggleText, useMonthly && styles.toggleTextActive]}>
            I'll enter monthly
          </Text>
        </Pressable>
      </View>

      {/* Input */}
      <View style={styles.inputCard}>
        <Text style={styles.inputLabel}>
          {useMonthly ? "Monthly income (PKR)" : "Annual income (PKR)"}
        </Text>
        <View style={styles.inputRow}>
          <Text style={styles.currency}>₨</Text>
          <TextInput
            style={styles.input}
            value={useMonthly ? formatDisplay(monthlyIncome) : formatDisplay(annualIncome)}
            onChangeText={(t) =>
              useMonthly
                ? handleChange(t, setMonthlyIncome)
                : handleChange(t, setAnnualIncome)
            }
            keyboardType="numeric"
            placeholder="0"
            placeholderTextColor={c.mutedForeground}
          />
        </View>

        {useMonthly && (parseFloat(monthlyIncome) > 0) && (
          <View style={styles.annualCalc}>
            <Feather name="refresh-cw" size={13} color={c.primary} />
            <Text style={styles.annualCalcText}>
              Annual = {formatPKR(parseFloat(monthlyIncome.replace(/,/g, "")) * 12)}
            </Text>
          </View>
        )}
      </View>

      {/* Income guidance */}
      <View style={styles.guideCard}>
        <Text style={styles.guideTitle}>Not sure about your income?</Text>
        <View style={styles.guideList}>
          <GuideItem icon="briefcase" text="Salaried? Check your payslip for gross monthly salary × 12" />
          <GuideItem icon="monitor" text="Freelancer? Add up all payments received over the past year" />
          <GuideItem icon="shopping-bag" text="Business? Use your total annual turnover / revenue" />
          <GuideItem icon="sun" text="Farmer? Estimate your total crop sales and livestock income" />
        </View>
      </View>

      {derivedAnnual > 0 && (
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Your annual income</Text>
          <Text style={styles.summaryValue}>{formatPKR(derivedAnnual)}</Text>
        </View>
      )}
    </WizardShell>
  );
}

function GuideItem({ icon, text }: { icon: any; text: string }) {
  return (
    <View style={styles.guideItem}>
      <Feather name={icon} size={14} color={c.primary} style={styles.guideIcon} />
      <Text style={styles.guideText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  toggle: {
    flexDirection: "row",
    backgroundColor: c.muted,
    borderRadius: colors.radius,
    padding: 4,
    marginBottom: 20,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: colors.radius - 2,
    alignItems: "center",
  },
  toggleBtnActive: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: c.mutedForeground,
    textAlign: "center",
  },
  toggleTextActive: { color: c.foreground },
  inputCard: {
    backgroundColor: c.card,
    borderRadius: colors.radius + 2,
    borderWidth: 1.5,
    borderColor: c.primary,
    padding: 16,
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    color: c.primary,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 8,
  },
  inputRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  currency: {
    fontSize: 28,
    fontFamily: "Inter_600SemiBold",
    color: c.primary,
  },
  input: {
    flex: 1,
    fontSize: 32,
    fontFamily: "Inter_700Bold",
    color: c.foreground,
    padding: 0,
  },
  annualCalc: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: c.border,
  },
  annualCalcText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: c.primary,
  },
  guideCard: {
    backgroundColor: c.muted,
    borderRadius: colors.radius,
    padding: 16,
    marginBottom: 16,
  },
  guideTitle: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: c.foreground,
    marginBottom: 12,
  },
  guideList: { gap: 10 },
  guideItem: { flexDirection: "row", gap: 8, alignItems: "flex-start" },
  guideIcon: { marginTop: 2 },
  guideText: {
    flex: 1,
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: c.mutedForeground,
    lineHeight: 19,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: c.secondary,
    borderRadius: colors.radius,
    padding: 14,
    borderWidth: 1,
    borderColor: c.primary,
  },
  summaryLabel: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    color: c.primary,
  },
  summaryValue: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    color: c.primary,
  },
});
