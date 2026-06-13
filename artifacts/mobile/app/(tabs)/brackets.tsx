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
  FILING_STATUS_LABELS,
  FilingStatus,
  STANDARD_DEDUCTIONS,
  TAX_BRACKETS_2024,
  TaxBracket,
} from "@/constants/taxData";
import { useTax } from "@/context/TaxContext";

const c = colors.light;

function formatCurrency(n: number) {
  return "$" + n.toLocaleString("en-US");
}

const FILING_STATUSES: FilingStatus[] = ["single", "married_jointly", "head_of_household"];

export default function BracketsScreen() {
  const insets = useSafeAreaInsets();
  const { result, filingStatus: calcStatus } = useTax();
  const [selectedStatus, setSelectedStatus] = useState<FilingStatus>(calcStatus);

  const brackets = TAX_BRACKETS_2024[selectedStatus];
  const webTop = Platform.OS === "web" ? 67 : insets.top;
  const webBottom = Platform.OS === "web" ? 34 : 0;

  const isInBracket = (bracket: TaxBracket): boolean => {
    if (!result || result.taxableIncome <= 0) return false;
    const max = bracket.max ?? Infinity;
    return result.taxableIncome > bracket.min && result.taxableIncome <= max;
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
      <Text style={styles.subheading}>2024 Federal Income Tax</Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabRow}
      >
        {FILING_STATUSES.map((status) => (
          <Pressable
            key={status}
            style={[styles.tab, selectedStatus === status && styles.tabActive]}
            onPress={() => {
              Haptics.selectionAsync();
              setSelectedStatus(status);
            }}
          >
            <Text
              style={[
                styles.tabText,
                selectedStatus === status && styles.tabTextActive,
              ]}
            >
              {FILING_STATUS_LABELS[status]}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <View style={styles.deductionNote}>
        <Text style={styles.deductionLabel}>Standard Deduction</Text>
        <Text style={styles.deductionValue}>
          {formatCurrency(STANDARD_DEDUCTIONS[selectedStatus])}
        </Text>
      </View>

      {result && (
        <View style={styles.currentIncomeBanner}>
          <Text style={styles.bannerText}>
            Your taxable income:{" "}
            <Text style={styles.bannerValue}>
              {formatCurrency(result.taxableIncome)}
            </Text>
          </Text>
        </View>
      )}

      <View style={styles.bracketList}>
        {brackets.map((bracket, i) => {
          const active = isInBracket(bracket);
          const barColor = BRACKET_COLORS[bracket.rate] ?? c.muted;
          return (
            <View
              key={i}
              style={[styles.bracketRow, active && styles.bracketRowActive]}
            >
              <View style={[styles.bracketBar, { backgroundColor: barColor }]} />
              <View style={styles.bracketContent}>
                <View style={styles.bracketLeft}>
                  <Text style={styles.bracketRate}>
                    {(bracket.rate * 100).toFixed(0)}%
                  </Text>
                  {active && (
                    <View style={styles.youAreHere}>
                      <Text style={styles.youAreHereText}>You're here</Text>
                    </View>
                  )}
                </View>
                <View style={styles.bracketRight}>
                  <Text style={styles.bracketRange}>
                    {formatCurrency(bracket.min)}
                    {bracket.max ? ` – ${formatCurrency(bracket.max)}` : "+"}
                  </Text>
                  <Text style={styles.bracketTaxNote}>
                    {bracket.max
                      ? `Tax: ${formatCurrency(Math.round((bracket.max - bracket.min) * bracket.rate))} max`
                      : `${(bracket.rate * 100).toFixed(0)}% on remainder`}
                  </Text>
                </View>
              </View>
            </View>
          );
        })}
      </View>

      <View style={styles.note}>
        <Text style={styles.noteText}>
          These are marginal rates. Each bracket only applies to income within that range — not your total income.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
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
    marginBottom: 20,
  },
  tabRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 20,
    paddingRight: 20,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 100,
    borderWidth: 1.5,
    borderColor: c.border,
    backgroundColor: c.background,
  },
  tabActive: {
    backgroundColor: c.secondary,
    borderColor: c.primary,
  },
  tabText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: c.mutedForeground,
  },
  tabTextActive: {
    color: c.primary,
  },
  deductionNote: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: c.muted,
    borderRadius: colors.radius,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 12,
  },
  deductionLabel: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    color: c.mutedForeground,
  },
  deductionValue: {
    fontSize: 14,
    fontFamily: "Inter_700Bold",
    color: c.foreground,
  },
  currentIncomeBanner: {
    backgroundColor: c.secondary,
    borderRadius: colors.radius,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: c.primary,
  },
  bannerText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: c.primary,
  },
  bannerValue: {
    fontFamily: "Inter_700Bold",
  },
  bracketList: {
    gap: 8,
    marginBottom: 20,
  },
  bracketRow: {
    flexDirection: "row",
    borderRadius: colors.radius,
    backgroundColor: c.card,
    borderWidth: 1,
    borderColor: c.border,
    overflow: "hidden",
  },
  bracketRowActive: {
    borderColor: c.primary,
    borderWidth: 2,
  },
  bracketBar: {
    width: 6,
  },
  bracketContent: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 14,
  },
  bracketLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  bracketRate: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    color: c.foreground,
    width: 52,
  },
  youAreHere: {
    backgroundColor: c.secondary,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 100,
  },
  youAreHereText: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    color: c.primary,
  },
  bracketRight: {
    alignItems: "flex-end",
  },
  bracketRange: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: c.foreground,
  },
  bracketTaxNote: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: c.mutedForeground,
    marginTop: 2,
  },
  note: {
    backgroundColor: c.muted,
    borderRadius: colors.radius,
    padding: 14,
  },
  noteText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: c.mutedForeground,
    lineHeight: 19,
  },
});
