import * as Haptics from "expo-haptics";
import React, { useState } from "react";
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
import {
  BRACKET_COLORS,
  IT_FREELANCER_RATE,
  TAX_BRACKETS_2024,
  TAX_YEAR,
  TaxBracket,
} from "@/constants/taxData";
import { useWizard } from "@/context/WizardContext";

const c = colors.light;

function formatPKR(n: number) {
  if (n >= 10000000) return "₨ " + (n / 10000000).toFixed(1) + " Cr";
  if (n >= 100000) return "₨ " + (n / 100000).toFixed(1) + " Lac";
  return "₨ " + n.toLocaleString("en-US");
}

type SlabKey = "salaried" | "non_salaried" | "it_freelancer";

const TABS: { key: SlabKey; label: string }[] = [
  { key: "salaried", label: "Salaried" },
  { key: "non_salaried", label: "Non-Salaried" },
  { key: "it_freelancer", label: "IT Freelancer" },
];

export default function BracketsScreen() {
  const insets = useSafeAreaInsets();
  const { result, derivedAnnual } = useWizard();
  const [selected, setSelected] = useState<SlabKey>("salaried");

  const webTop = Platform.OS === "web" ? 67 : insets.top;
  const webBottom = Platform.OS === "web" ? 34 : 0;

  const brackets = selected !== "it_freelancer" ? TAX_BRACKETS_2024[selected] : null;

  const isInBracket = (bracket: TaxBracket): boolean => {
    if (!derivedAnnual || derivedAnnual <= 0) return false;
    const max = bracket.max ?? Infinity;
    return derivedAnnual > bracket.min && derivedAnnual <= max;
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: c.background }]}
      contentContainerStyle={[
        styles.scroll,
        { paddingTop: webTop + 16, paddingBottom: webBottom + 120 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.heading}>Tax Brackets</Text>
      <Text style={styles.subheading}>FBR · Tax Year {TAX_YEAR}</Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabRow}
      >
        {TABS.map(({ key, label }) => (
          <Pressable
            key={key}
            style={[styles.tab, selected === key && styles.tabActive]}
            onPress={() => { Haptics.selectionAsync(); setSelected(key); }}
          >
            <Text style={[styles.tabText, selected === key && styles.tabTextActive]}>
              {label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {derivedAnnual > 0 && (
        <View style={styles.banner}>
          <Text style={styles.bannerText}>
            Your annual income: <Text style={styles.bannerValue}>{formatPKR(derivedAnnual)}</Text>
          </Text>
        </View>
      )}

      {selected === "it_freelancer" ? (
        <View>
          <View style={styles.freelancerCard}>
            <Text style={styles.freelancerRate}>0.25%</Text>
            <Text style={styles.freelancerTitle}>Final Tax on Foreign Remittances</Text>
            <Text style={styles.freelancerDesc}>
              IT and digital services income from foreign clients is taxed at a flat 0.25% withholding tax. This is your complete federal tax — no additional income tax applies.
            </Text>
          </View>
          <View style={styles.exCard}>
            <Text style={styles.exTitle}>Example Calculation</Text>
            <ExRow label="Annual earnings" value="₨ 24,00,000" />
            <ExRow label="Tax @ 0.25%" value="₨ 6,000" />
            <ExRow label="Take-home" value="₨ 23,94,000" highlight />
          </View>
          <View style={styles.note}>
            <Text style={styles.noteText}>
              Applies under SRO 586(I)/2023. Verify your eligibility with FBR or a tax consultant.
            </Text>
          </View>
        </View>
      ) : (
        <>
          <View style={styles.bracketList}>
            {brackets!.map((bracket, i) => {
              const active = isInBracket(bracket);
              const barColor = BRACKET_COLORS[bracket.rate] ?? c.muted;
              return (
                <View key={i} style={[styles.row, active && styles.rowActive]}>
                  <View style={[styles.bar, { backgroundColor: barColor }]} />
                  <View style={styles.rowContent}>
                    <View style={styles.rowLeft}>
                      <Text style={styles.rate}>
                        {(bracket.rate * 100).toFixed(0)}%
                      </Text>
                      {active && (
                        <View style={styles.youHere}>
                          <Text style={styles.youHereText}>You're here</Text>
                        </View>
                      )}
                    </View>
                    <View style={styles.rowRight}>
                      <Text style={styles.range}>
                        {formatPKR(bracket.min)}
                        {bracket.max ? ` – ${formatPKR(bracket.max)}` : " and above"}
                      </Text>
                      {bracket.fixedAmount > 0 && (
                        <Text style={styles.formula}>
                          {formatPKR(bracket.fixedAmount)} + {(bracket.rate * 100).toFixed(0)}% on excess
                        </Text>
                      )}
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
          <View style={styles.note}>
            <Text style={styles.noteText}>
              These are marginal rates — only the income within each bracket is taxed at that rate, not your total income.
            </Text>
          </View>
        </>
      )}
    </ScrollView>
  );
}

function ExRow({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <View style={styles.exRow}>
      <Text style={styles.exLabel}>{label}</Text>
      <Text style={[styles.exValue, highlight && { color: c.accent, fontFamily: "Inter_700Bold" }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 20 },
  heading: { fontSize: 28, fontFamily: "Inter_700Bold", color: c.foreground, marginBottom: 4 },
  subheading: { fontSize: 14, fontFamily: "Inter_400Regular", color: c.mutedForeground, marginBottom: 20 },
  tabRow: { flexDirection: "row", gap: 8, marginBottom: 16, paddingRight: 20 },
  tab: {
    paddingVertical: 8, paddingHorizontal: 16, borderRadius: 100,
    borderWidth: 1.5, borderColor: c.border, backgroundColor: c.background,
  },
  tabActive: { backgroundColor: c.secondary, borderColor: c.primary },
  tabText: { fontSize: 13, fontFamily: "Inter_500Medium", color: c.mutedForeground },
  tabTextActive: { color: c.primary },
  banner: {
    backgroundColor: c.secondary, borderRadius: colors.radius,
    paddingHorizontal: 16, paddingVertical: 10, marginBottom: 16,
    borderWidth: 1, borderColor: c.primary,
  },
  bannerText: { fontSize: 13, fontFamily: "Inter_400Regular", color: c.primary },
  bannerValue: { fontFamily: "Inter_700Bold" },
  bracketList: { gap: 8, marginBottom: 20 },
  row: {
    flexDirection: "row", borderRadius: colors.radius,
    backgroundColor: c.card, borderWidth: 1, borderColor: c.border, overflow: "hidden",
  },
  rowActive: { borderColor: c.primary, borderWidth: 2 },
  bar: { width: 6 },
  rowContent: {
    flex: 1, flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", padding: 14,
  },
  rowLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  rate: { fontSize: 22, fontFamily: "Inter_700Bold", color: c.foreground, width: 52 },
  youHere: {
    backgroundColor: c.secondary, paddingVertical: 3,
    paddingHorizontal: 8, borderRadius: 100,
  },
  youHereText: { fontSize: 11, fontFamily: "Inter_600SemiBold", color: c.primary },
  rowRight: { alignItems: "flex-end" },
  range: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: c.foreground },
  formula: { fontSize: 11, fontFamily: "Inter_400Regular", color: c.mutedForeground, marginTop: 2 },
  freelancerCard: {
    backgroundColor: c.secondary, borderRadius: colors.radius + 4,
    borderWidth: 1.5, borderColor: c.primary, padding: 24, alignItems: "center", marginBottom: 16,
  },
  freelancerRate: { fontSize: 52, fontFamily: "Inter_700Bold", color: c.primary },
  freelancerTitle: {
    fontSize: 15, fontFamily: "Inter_600SemiBold", color: c.foreground,
    marginTop: 4, marginBottom: 12, textAlign: "center",
  },
  freelancerDesc: {
    fontSize: 13, fontFamily: "Inter_400Regular", color: c.mutedForeground,
    textAlign: "center", lineHeight: 20,
  },
  exCard: {
    backgroundColor: c.card, borderRadius: colors.radius, borderWidth: 1,
    borderColor: c.border, padding: 16, gap: 10, marginBottom: 16,
  },
  exTitle: {
    fontSize: 13, fontFamily: "Inter_600SemiBold", color: c.mutedForeground,
    textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4,
  },
  exRow: { flexDirection: "row", justifyContent: "space-between" },
  exLabel: { fontSize: 13, fontFamily: "Inter_400Regular", color: c.mutedForeground },
  exValue: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: c.foreground },
  note: {
    backgroundColor: c.muted, borderRadius: colors.radius, padding: 14, marginBottom: 12,
  },
  noteText: { fontSize: 13, fontFamily: "Inter_400Regular", color: c.mutedForeground, lineHeight: 19 },
});
