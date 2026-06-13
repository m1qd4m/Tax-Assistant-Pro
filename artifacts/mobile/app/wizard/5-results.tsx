import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import colors from "@/constants/colors";
import { PROFESSION_OPTIONS } from "@/constants/taxData";
import { useWizard } from "@/context/WizardContext";

const c = colors.light;

function formatPKR(n: number) {
  if (n >= 10000000) return "₨ " + (n / 10000000).toFixed(2) + " Cr";
  if (n >= 100000) return "₨ " + (n / 100000).toFixed(2) + " Lac";
  return "₨ " + Math.round(n).toLocaleString("en-US");
}

export default function ResultsScreen() {
  const insets = useSafeAreaInsets();
  const {
    name, result, laws, derivedAnnual,
    isWidow, professionCategory,
    saveResult, resetWizard,
  } = useWizard();

  const [saved, setSaved] = useState(false);

  const webBottom = Platform.OS === "web" ? 20 : insets.bottom;

  const profInfo = PROFESSION_OPTIONS.find((p) => p.key === professionCategory);

  // Redirect to start if wizard hasn't been completed
  useEffect(() => {
    if (!result) {
      router.replace("/wizard/1-personal");
    }
  }, [result]);

  const handleSave = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    saveResult();
    setSaved(true);
  };

  const handleStartAgain = () => {
    resetWizard();
    router.replace("/(tabs)");
  };

  if (!result) {
    return <View style={[styles.container, { backgroundColor: c.background }]} />;
  }

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: webBottom + 120 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.headerSection}>
          <View style={styles.headerIcon}>
            <Text style={styles.headerIconText}>₨</Text>
          </View>
          <Text style={styles.greeting}>
            {name ? `Here's your tax estimate, ${name.split(" ")[0]}!` : "Your Tax Estimate"}
          </Text>
          <Text style={styles.subGreeting}>Tax Year 2024–25 · FBR Pakistan</Text>
        </View>

        {/* Main result */}
        {result.isAgriculture ? (
          <View style={styles.agricultureCard}>
            <Text style={styles.agricultureTitle}>🌾 Federal Tax Exempt</Text>
            <Text style={styles.agricultureText}>
              Your agricultural income is exempt from federal income tax under Section 41 of the Income Tax Ordinance 2001. You do not owe any federal tax on this income.
            </Text>
            <Text style={styles.agricultureNote}>
              Note: Your province may still levy Agricultural Income Tax. Check with your provincial revenue authority.
            </Text>
          </View>
        ) : (
          <View style={styles.resultCard}>
            <Text style={styles.resultCardLabel}>Total Tax Payable</Text>
            <Text style={styles.resultAmount}>{formatPKR(result.finalTax)}</Text>

            <View style={styles.rateRow}>
              <View style={styles.rateChip}>
                <Text style={styles.rateChipText}>
                  {(result.effectiveRate * 100).toFixed(1)}% effective rate
                </Text>
              </View>
              <View style={[styles.rateChip, styles.rateChipGray]}>
                <Text style={[styles.rateChipText, styles.rateChipTextGray]}>
                  {(result.marginalRate * 100).toFixed(0)}% marginal rate
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            {/* Breakdown */}
            <View style={styles.breakdown}>
              <BRow label="Gross Income" value={formatPKR(derivedAnnual)} />
              <BRow label="Tax on income" value={formatPKR(result.taxBeforeRelief)} />
              {isWidow && result.widowRelief > 0 && (
                <BRow
                  label="Widow Relief (50%)"
                  value={`– ${formatPKR(result.widowRelief)}`}
                  highlight
                />
              )}
              {result.taxBeforeRelief === 0 && (
                <View style={styles.zeroTaxNote}>
                  <Feather name="check-circle" size={15} color={c.success} />
                  <Text style={styles.zeroTaxText}>
                    Your income is below the taxable threshold (₨ 6,00,000). No tax is due.
                  </Text>
                </View>
              )}
              <View style={[styles.bRow, styles.bRowFinal]}>
                <Text style={styles.bLabelFinal}>Final Tax</Text>
                <Text style={styles.bValueFinal}>{formatPKR(result.finalTax)}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.takeHomeRow}>
              <View>
                <Text style={styles.takeHomeLabel}>Estimated Take-Home</Text>
                <Text style={styles.takeHomeSub}>
                  {formatPKR(result.afterTaxIncome / 12)} per month
                </Text>
              </View>
              <Text style={styles.takeHomeValue}>{formatPKR(result.afterTaxIncome)}</Text>
            </View>
          </View>
        )}

        {/* Profession badge */}
        {profInfo && (
          <View style={styles.profBadge}>
            <Text style={styles.profEmoji}>{profInfo.emoji}</Text>
            <Text style={styles.profLabel}>Calculated as: {profInfo.label}</Text>
          </View>
        )}

        {/* Laws section */}
        <Text style={styles.lawsHeading}>Laws that apply to you</Text>
        <Text style={styles.lawsSubheading}>
          Based on your profile, here are the specific provisions of Pakistani tax law relevant to you:
        </Text>

        {laws.map((law, i) => (
          <View key={i} style={[styles.lawCard, law.isRelief && styles.lawCardRelief]}>
            <View style={styles.lawHeader}>
              <View style={[styles.lawBadge, law.isRelief && styles.lawBadgeRelief]}>
                <Text style={[styles.lawBadgeText, law.isRelief && styles.lawBadgeTextRelief]}>
                  {law.isRelief ? "✓ Relief" : "ℹ Info"}
                </Text>
              </View>
              <Text style={[styles.lawTitle, law.isRelief && styles.lawTitleRelief]}>
                {law.title}
              </Text>
            </View>
            <Text style={styles.lawSection}>{law.section}</Text>
            <Text style={styles.lawText}>{law.explanation}</Text>
          </View>
        ))}

        {/* Disclaimer */}
        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>
            This estimate is based on FBR rates for tax year 2024–25. For an exact calculation, consult a tax professional or file at iris.fbr.gov.pk.
          </Text>
        </View>
      </ScrollView>

      {/* Action buttons */}
      <View style={[styles.footer, { paddingBottom: webBottom + 16 }]}>
        <Pressable
          style={({ pressed }) => [
            styles.saveBtn,
            saved && styles.saveBtnSaved,
            pressed && !saved && { opacity: 0.8 },
          ]}
          onPress={handleSave}
          disabled={saved}
        >
          <Feather name={saved ? "check" : "bookmark"} size={16} color={saved ? c.success : c.primary} />
          <Text style={[styles.saveBtnText, saved && { color: c.success }]}>
            {saved ? "Saved!" : "Save Result"}
          </Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.againBtn, pressed && { opacity: 0.8 }]}
          onPress={handleStartAgain}
        >
          <Feather name="refresh-cw" size={15} color="#FFFFFF" />
          <Text style={styles.againBtnText}>Start Again</Text>
        </Pressable>
      </View>
    </View>
  );
}

function BRow({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <View style={styles.bRow}>
      <Text style={styles.bLabel}>{label}</Text>
      <Text style={[styles.bValue, highlight && { color: c.accent, fontFamily: "Inter_700Bold" }]}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  scroll: { paddingHorizontal: 20, paddingTop: 20 },

  headerSection: { alignItems: "center", marginBottom: 24 },
  headerIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: c.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  headerIconText: { fontSize: 26, fontFamily: "Inter_700Bold", color: "#FFFFFF" },
  greeting: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    color: c.foreground,
    textAlign: "center",
  },
  subGreeting: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: c.mutedForeground,
    marginTop: 4,
  },

  agricultureCard: {
    backgroundColor: c.secondary,
    borderRadius: colors.radius + 4,
    borderWidth: 1.5,
    borderColor: c.primary,
    padding: 20,
    marginBottom: 16,
  },
  agricultureTitle: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    color: c.primary,
    marginBottom: 8,
  },
  agricultureText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: c.foreground,
    lineHeight: 21,
    marginBottom: 12,
  },
  agricultureNote: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    color: c.mutedForeground,
    fontStyle: "italic",
  },

  resultCard: {
    backgroundColor: c.card,
    borderRadius: colors.radius + 4,
    borderWidth: 1.5,
    borderColor: c.border,
    padding: 20,
    marginBottom: 12,
  },
  resultCardLabel: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    color: c.mutedForeground,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  resultAmount: {
    fontSize: 38,
    fontFamily: "Inter_700Bold",
    color: c.foreground,
    marginBottom: 12,
  },
  rateRow: { flexDirection: "row", gap: 8, marginBottom: 4 },
  rateChip: {
    backgroundColor: c.secondary,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 100,
  },
  rateChipGray: { backgroundColor: c.muted },
  rateChipText: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    color: c.primary,
  },
  rateChipTextGray: { color: c.mutedForeground },
  divider: { height: 1, backgroundColor: c.border, marginVertical: 14 },
  breakdown: { gap: 10 },
  bRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  bRowFinal: {
    marginTop: 4,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: c.border,
  },
  bLabel: { fontSize: 14, fontFamily: "Inter_400Regular", color: c.mutedForeground },
  bValue: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: c.foreground },
  bLabelFinal: { fontSize: 15, fontFamily: "Inter_700Bold", color: c.foreground },
  bValueFinal: { fontSize: 16, fontFamily: "Inter_700Bold", color: c.foreground },
  zeroTaxNote: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: c.successLight,
    borderRadius: colors.radius,
    padding: 10,
  },
  zeroTaxText: {
    flex: 1,
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: c.success,
    lineHeight: 18,
  },
  takeHomeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  takeHomeLabel: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: c.foreground },
  takeHomeSub: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: c.mutedForeground,
    marginTop: 2,
  },
  takeHomeValue: { fontSize: 22, fontFamily: "Inter_700Bold", color: c.accent },

  profBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: c.muted,
    borderRadius: 100,
    paddingVertical: 6,
    paddingHorizontal: 14,
    alignSelf: "flex-start",
    marginBottom: 24,
  },
  profEmoji: { fontSize: 16 },
  profLabel: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: c.mutedForeground,
  },

  lawsHeading: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    color: c.foreground,
    marginBottom: 6,
  },
  lawsSubheading: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: c.mutedForeground,
    marginBottom: 16,
    lineHeight: 19,
  },

  lawCard: {
    backgroundColor: c.card,
    borderRadius: colors.radius,
    borderWidth: 1,
    borderColor: c.border,
    padding: 16,
    marginBottom: 10,
  },
  lawCardRelief: {
    backgroundColor: c.secondary,
    borderColor: c.primary,
    borderWidth: 1.5,
  },
  lawHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginBottom: 4,
    flexWrap: "wrap",
  },
  lawBadge: {
    backgroundColor: c.muted,
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 100,
  },
  lawBadgeRelief: { backgroundColor: c.primary },
  lawBadgeText: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    color: c.mutedForeground,
  },
  lawBadgeTextRelief: { color: "#FFFFFF" },
  lawTitle: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Inter_700Bold",
    color: c.foreground,
  },
  lawTitleRelief: { color: c.primary },
  lawSection: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    color: c.accent,
    marginBottom: 8,
  },
  lawText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: c.foreground,
    lineHeight: 20,
  },

  disclaimer: {
    backgroundColor: c.muted,
    borderRadius: colors.radius,
    padding: 12,
    marginTop: 8,
    marginBottom: 8,
  },
  disclaimerText: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: c.mutedForeground,
    lineHeight: 17,
    textAlign: "center",
  },

  footer: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: c.border,
    backgroundColor: c.background,
  },
  saveBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    height: 50,
    borderRadius: colors.radius,
    borderWidth: 1.5,
    borderColor: c.primary,
    backgroundColor: c.background,
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
  againBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    height: 50,
    borderRadius: colors.radius,
    backgroundColor: c.primary,
  },
  againBtnText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: "#FFFFFF",
  },
  errorText: {
    fontSize: 16,
    fontFamily: "Inter_500Medium",
    color: c.mutedForeground,
    textAlign: "center",
    marginBottom: 16,
  },
  retryBtn: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: colors.radius,
    backgroundColor: c.primary,
  },
  retryBtnText: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: "#FFFFFF",
  },
});
