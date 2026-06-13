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
import {
  INCOME_TYPE_DESCRIPTIONS,
  INCOME_TYPE_LABELS,
  IncomeType,
  TAX_YEAR,
} from "@/constants/taxData";
import { useTax } from "@/context/TaxContext";

const c = colors.light;

function formatPKR(n: number) {
  if (n >= 10000000) return "₨" + (n / 10000000).toFixed(2) + " Cr";
  if (n >= 100000) return "₨" + (n / 100000).toFixed(2) + " Lac";
  return "₨" + Math.round(n).toLocaleString("en-PK");
}

function formatInputDisplay(raw: string) {
  const n = parseInt(raw.replace(/,/g, ""), 10);
  if (isNaN(n)) return "";
  return n.toLocaleString("en-PK");
}

const INCOME_TYPES: IncomeType[] = ["salaried", "non_salaried", "it_freelancer"];

export default function CalculatorScreen() {
  const insets = useSafeAreaInsets();
  const {
    grossIncome, setGrossIncome,
    monthlyIncome, setMonthlyIncome,
    useMonthly, setUseMonthly,
    incomeType, setIncomeType,
    isWidow, setIsWidow,
    result, derivedAnnual,
    saveToHistory,
  } = useTax();

  const [saved, setSaved] = useState(false);

  const webTop = Platform.OS === "web" ? 67 : insets.top;
  const webBottom = Platform.OS === "web" ? 34 : 0;

  const handleSave = () => {
    if (!result) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    saveToHistory();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleRawChange = (text: string, setter: (v: string) => void) => {
    setSaved(false);
    setter(text.replace(/[^0-9]/g, ""));
  };

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
        {/* Header */}
        <View style={styles.headerRow}>
          <View style={styles.logoMark}>
            <Text style={styles.logoText}>₨</Text>
          </View>
          <View>
            <Text style={styles.heading}>Tax Calculator</Text>
            <Text style={styles.subheading}>Pakistan FBR · Tax Year {TAX_YEAR}</Text>
          </View>
        </View>

        {/* Step 1: Who are you? */}
        <SectionLabel step="1" title="What best describes you?" />
        <View style={styles.typeList}>
          {INCOME_TYPES.map((type) => (
            <Pressable
              key={type}
              style={[styles.typeCard, incomeType === type && styles.typeCardActive]}
              onPress={() => {
                Haptics.selectionAsync();
                setIncomeType(type);
                setSaved(false);
              }}
            >
              <View style={styles.typeCardInner}>
                <View style={[styles.radio, incomeType === type && styles.radioActive]}>
                  {incomeType === type && <View style={styles.radioDot} />}
                </View>
                <View style={styles.typeText}>
                  <Text style={[styles.typeLabel, incomeType === type && styles.typeLabelActive]}>
                    {INCOME_TYPE_LABELS[type]}
                  </Text>
                  <Text style={styles.typeDesc}>{INCOME_TYPE_DESCRIPTIONS[type]}</Text>
                </View>
              </View>
            </Pressable>
          ))}
        </View>

        {/* Step 2: Income */}
        <SectionLabel step="2" title="What is your income?" />

        <View style={styles.incomeToggleRow}>
          <Pressable
            style={[styles.incomeToggleBtn, !useMonthly && styles.incomeToggleBtnActive]}
            onPress={() => { Haptics.selectionAsync(); setUseMonthly(false); setSaved(false); }}
          >
            <Text style={[styles.incomeToggleText, !useMonthly && styles.incomeToggleTextActive]}>
              I know my annual income
            </Text>
          </Pressable>
          <Pressable
            style={[styles.incomeToggleBtn, useMonthly && styles.incomeToggleBtnActive]}
            onPress={() => { Haptics.selectionAsync(); setUseMonthly(true); setSaved(false); }}
          >
            <Text style={[styles.incomeToggleText, useMonthly && styles.incomeToggleTextActive]}>
              I'll enter monthly
            </Text>
          </Pressable>
        </View>

        {!useMonthly ? (
          <View style={styles.inputCard}>
            <Text style={styles.inputLabel}>Annual Income (PKR)</Text>
            <View style={styles.inputRow}>
              <Text style={styles.currencySymbol}>₨</Text>
              <TextInput
                style={styles.incomeInput}
                value={formatInputDisplay(grossIncome)}
                onChangeText={(t) => handleRawChange(t, setGrossIncome)}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor={c.mutedForeground}
              />
            </View>
          </View>
        ) : (
          <View style={styles.inputCard}>
            <Text style={styles.inputLabel}>Monthly Income (PKR)</Text>
            <View style={styles.inputRow}>
              <Text style={styles.currencySymbol}>₨</Text>
              <TextInput
                style={styles.incomeInput}
                value={formatInputDisplay(monthlyIncome)}
                onChangeText={(t) => handleRawChange(t, setMonthlyIncome)}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor={c.mutedForeground}
              />
            </View>
            {parseFloat(monthlyIncome) > 0 && (
              <View style={styles.annualHint}>
                <Feather name="info" size={13} color={c.primary} />
                <Text style={styles.annualHintText}>
                  Annual equivalent: {formatPKR(parseFloat(monthlyIncome.replace(/,/g, "")) * 12)}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Step 3: Special status */}
        <SectionLabel step="3" title="Any special status?" />
        <View style={styles.switchCard}>
          <View style={styles.switchRow}>
            <View style={styles.flex}>
              <Text style={styles.switchLabel}>I am a widow / widower</Text>
              <Text style={styles.switchHint}>
                Widows receive a 50% relief on computed tax under FBR provisions
              </Text>
            </View>
            <Switch
              value={isWidow}
              onValueChange={(v) => {
                Haptics.selectionAsync();
                setIsWidow(v);
                setSaved(false);
              }}
              trackColor={{ false: c.border, true: c.primary }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* Results */}
        {result && derivedAnnual > 0 ? (
          <>
            <View style={styles.resultCard}>
              <Text style={styles.resultTitle}>Your Tax Estimate</Text>

              <View style={styles.resultMain}>
                <Text style={styles.totalTaxLabel}>Total Tax Payable</Text>
                <Text style={styles.totalTaxAmount}>{formatPKR(result.finalTax)}</Text>
                <View style={styles.rateRow}>
                  <RateChip label={`${(result.effectiveRate * 100).toFixed(1)}% effective`} primary />
                  <RateChip label={`${(result.marginalRate * 100).toFixed(0)}% marginal`} />
                </View>
              </View>

              <View style={styles.divider} />

              {result.isITFreelancer ? (
                <View style={styles.breakdown}>
                  <ResultRow label="Annual Income" value={formatPKR(result.grossIncome)} />
                  <ResultRow label="Tax Rate (Final)" value="0.25% on foreign remittance" />
                  <ResultRow label="Tax Payable" value={formatPKR(result.finalTax)} />
                </View>
              ) : (
                <View style={styles.breakdown}>
                  <ResultRow label="Annual Income" value={formatPKR(result.grossIncome)} />
                  <ResultRow label="Tax on Income" value={formatPKR(result.taxBeforeRelief)} />
                  {isWidow && (
                    <ResultRow
                      label="Widow Relief (50%)"
                      value={`– ${formatPKR(result.widowRelief)}`}
                      accent
                    />
                  )}
                  <ResultRow label="Final Tax" value={formatPKR(result.finalTax)} bold />
                </View>
              )}

              <View style={styles.divider} />

              <View style={styles.takeHomeRow}>
                <View>
                  <Text style={styles.takeHomeLabel}>Estimated Take-Home</Text>
                  <Text style={styles.takeHomeSub}>
                    {formatPKR(result.afterTaxIncome / 12)} / month
                  </Text>
                </View>
                <Text style={styles.takeHomeValue}>{formatPKR(result.afterTaxIncome)}</Text>
              </View>
            </View>

            {result.taxBeforeRelief === 0 && !result.isITFreelancer && (
              <View style={styles.zeroTaxBanner}>
                <Feather name="check-circle" size={18} color={c.success} />
                <Text style={styles.zeroTaxText}>
                  Your income is below the taxable threshold. No tax is due.
                </Text>
              </View>
            )}

            <Pressable
              style={({ pressed }) => [
                styles.saveBtn,
                pressed && { opacity: 0.7 },
                saved && styles.saveBtnSaved,
              ]}
              onPress={handleSave}
            >
              <Feather name={saved ? "check" : "bookmark"} size={16} color={saved ? c.success : c.primary} />
              <Text style={[styles.saveBtnText, saved && { color: c.success }]}>
                {saved ? "Saved to History" : "Save Calculation"}
              </Text>
            </Pressable>

            <View style={styles.disclaimer}>
              <Text style={styles.disclaimerText}>
                This is an estimate based on FBR tax year {TAX_YEAR} rates. Consult a tax professional or visit fbr.gov.pk for your exact tax liability.
              </Text>
            </View>
          </>
        ) : (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Text style={styles.emptyIconText}>₨</Text>
            </View>
            <Text style={styles.emptyTitle}>Enter your income above</Text>
            <Text style={styles.emptyText}>
              Your personalised tax estimate will appear here
            </Text>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function SectionLabel({ step, title }: { step: string; title: string }) {
  return (
    <View style={styles.sectionLabel}>
      <View style={styles.stepBadge}>
        <Text style={styles.stepBadgeText}>{step}</Text>
      </View>
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );
}

function RateChip({ label, primary = false }: { label: string; primary?: boolean }) {
  return (
    <View style={[styles.rateChip, primary && styles.rateChipPrimary]}>
      <Text style={[styles.rateChipText, primary && styles.rateChipTextPrimary]}>{label}</Text>
    </View>
  );
}

function ResultRow({
  label, value, accent = false, bold = false,
}: {
  label: string; value: string; accent?: boolean; bold?: boolean;
}) {
  return (
    <View style={styles.resultRow}>
      <Text style={styles.resultRowLabel}>{label}</Text>
      <Text
        style={[
          styles.resultRowValue,
          accent && { color: c.accent },
          bold && { fontFamily: "Inter_700Bold", color: c.foreground },
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: { paddingHorizontal: 20 },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 28,
  },
  logoMark: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: c.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    color: "#FFFFFF",
  },
  heading: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    color: c.foreground,
  },
  subheading: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: c.mutedForeground,
    marginTop: 1,
  },

  sectionLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
    marginTop: 8,
  },
  stepBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: c.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  stepBadgeText: {
    fontSize: 12,
    fontFamily: "Inter_700Bold",
    color: "#FFFFFF",
  },
  sectionTitle: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: c.foreground,
  },

  typeList: { gap: 8, marginBottom: 24 },
  typeCard: {
    borderRadius: colors.radius,
    borderWidth: 1.5,
    borderColor: c.border,
    backgroundColor: c.card,
    padding: 14,
  },
  typeCardActive: {
    borderColor: c.primary,
    backgroundColor: c.secondary,
  },
  typeCardInner: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: c.border,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  radioActive: { borderColor: c.primary },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: c.primary,
  },
  typeText: { flex: 1 },
  typeLabel: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: c.mutedForeground,
  },
  typeLabelActive: { color: c.primary },
  typeDesc: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: c.mutedForeground,
    marginTop: 2,
    lineHeight: 17,
  },

  incomeToggleRow: {
    flexDirection: "row",
    backgroundColor: c.muted,
    borderRadius: colors.radius,
    padding: 4,
    marginBottom: 12,
  },
  incomeToggleBtn: {
    flex: 1,
    paddingVertical: 9,
    paddingHorizontal: 8,
    borderRadius: colors.radius - 2,
    alignItems: "center",
  },
  incomeToggleBtnActive: {
    backgroundColor: c.white,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 2,
  },
  incomeToggleText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: c.mutedForeground,
    textAlign: "center",
  },
  incomeToggleTextActive: { color: c.foreground },

  inputCard: {
    backgroundColor: c.card,
    borderRadius: colors.radius,
    borderWidth: 1.5,
    borderColor: c.border,
    padding: 14,
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    color: c.mutedForeground,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  currencySymbol: {
    fontSize: 22,
    fontFamily: "Inter_600SemiBold",
    color: c.primary,
  },
  incomeInput: {
    flex: 1,
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    color: c.foreground,
    padding: 0,
  },
  annualHint: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: c.border,
  },
  annualHintText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: c.primary,
  },

  switchCard: {
    backgroundColor: c.card,
    borderRadius: colors.radius,
    borderWidth: 1.5,
    borderColor: c.border,
    padding: 14,
    marginBottom: 24,
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  switchLabel: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: c.foreground,
  },
  switchHint: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: c.mutedForeground,
    marginTop: 3,
    lineHeight: 17,
  },

  resultCard: {
    backgroundColor: c.card,
    borderRadius: colors.radius + 4,
    borderWidth: 1.5,
    borderColor: c.border,
    padding: 20,
    marginBottom: 12,
  },
  resultTitle: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    color: c.mutedForeground,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 16,
  },
  resultMain: { alignItems: "center", marginBottom: 16 },
  totalTaxLabel: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: c.mutedForeground,
    marginBottom: 6,
  },
  totalTaxAmount: {
    fontSize: 38,
    fontFamily: "Inter_700Bold",
    color: c.foreground,
    marginBottom: 10,
  },
  rateRow: { flexDirection: "row", gap: 8 },
  rateChip: {
    backgroundColor: c.muted,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 100,
  },
  rateChipPrimary: { backgroundColor: c.secondary },
  rateChipText: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    color: c.mutedForeground,
  },
  rateChipTextPrimary: { color: c.primary },
  divider: {
    height: 1,
    backgroundColor: c.border,
    marginVertical: 14,
  },
  breakdown: { gap: 10 },
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
  takeHomeSub: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: c.mutedForeground,
    marginTop: 2,
  },
  takeHomeValue: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    color: c.accent,
  },

  zeroTaxBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: c.successLight,
    borderRadius: colors.radius,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: c.success,
  },
  zeroTaxText: {
    flex: 1,
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: c.success,
    lineHeight: 18,
  },

  saveBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 50,
    borderRadius: colors.radius,
    borderWidth: 1.5,
    borderColor: c.primary,
    backgroundColor: c.background,
    marginBottom: 12,
  },
  saveBtnSaved: {
    borderColor: c.success,
    backgroundColor: c.successLight,
  },
  saveBtnText: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: c.primary,
  },

  disclaimer: {
    backgroundColor: c.muted,
    borderRadius: colors.radius,
    padding: 12,
    marginBottom: 8,
  },
  disclaimerText: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: c.mutedForeground,
    lineHeight: 17,
    textAlign: "center",
  },

  emptyState: {
    alignItems: "center",
    paddingTop: 40,
    gap: 10,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: c.secondary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  emptyIconText: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    color: c.primary,
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
    lineHeight: 20,
    paddingHorizontal: 20,
  },
});
