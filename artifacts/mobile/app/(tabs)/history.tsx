import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import colors from "@/constants/colors";
import { PROFESSION_OPTIONS } from "@/constants/taxData";
import { SavedResult, useWizard } from "@/context/WizardContext";

const c = colors.light;

function formatPKR(n: number) {
  if (n >= 10000000) return "₨ " + (n / 10000000).toFixed(2) + " Cr";
  if (n >= 100000) return "₨ " + (n / 100000).toFixed(1) + " Lac";
  return "₨ " + Math.round(n).toLocaleString("en-US");
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-PK", {
    month: "short", day: "numeric", year: "numeric",
  });
}

export default function HistoryScreen() {
  const insets = useSafeAreaInsets();
  const { savedHistory, deleteResult } = useWizard();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const webTop = Platform.OS === "web" ? 67 : insets.top;
  const webBottom = Platform.OS === "web" ? 34 : 0;

  const handleDelete = (id: string) => {
    if (Platform.OS === "web") { deleteResult(id); return; }
    Alert.alert("Delete", "Remove this calculation?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete", style: "destructive",
        onPress: () => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          deleteResult(id);
        },
      },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <View style={[styles.header, { paddingTop: webTop + 16, borderBottomColor: c.border }]}>
        <View>
          <Text style={styles.heading}>History</Text>
          <Text style={styles.subheading}>
            {savedHistory.length === 0
              ? "No saved calculations yet"
              : `${savedHistory.length} saved result${savedHistory.length > 1 ? "s" : ""}`}
          </Text>
        </View>
      </View>

      <FlatList
        data={savedHistory}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.list, { paddingBottom: webBottom + 120 }]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Feather name="clock" size={48} color={c.border} />
            <Text style={styles.emptyTitle}>No calculations yet</Text>
            <Text style={styles.emptyText}>
              Complete the tax calculator to save a result here
            </Text>
            <Pressable
              style={styles.startBtn}
              onPress={() => router.push("/wizard/1-personal")}
            >
              <Text style={styles.startBtnText}>Start Calculator</Text>
            </Pressable>
          </View>
        }
        renderItem={({ item }) => (
          <HistoryCard
            entry={item}
            expanded={expandedId === item.id}
            onToggle={() => setExpandedId(expandedId === item.id ? null : item.id)}
            onDelete={() => handleDelete(item.id)}
          />
        )}
      />
    </View>
  );
}

function HistoryCard({
  entry, expanded, onToggle, onDelete,
}: {
  entry: SavedResult;
  expanded: boolean;
  onToggle: () => void;
  onDelete: () => void;
}) {
  const { result, state, laws } = entry;
  const prof = PROFESSION_OPTIONS.find((p) => p.key === state.professionCategory);

  return (
    <View style={styles.card}>
      <Pressable onPress={onToggle} style={styles.cardHeader}>
        <Text style={styles.cardEmoji}>{prof?.emoji ?? "₨"}</Text>
        <View style={styles.cardLeft}>
          <Text style={styles.cardName}>{state.name || "Unnamed"}</Text>
          <Text style={styles.cardMeta}>
            {prof?.label ?? "–"}
            {state.maritalStatus === "widow" ? " · Widow" : ""}
            {" · "}{formatDate(entry.date)}
          </Text>
        </View>
        <View style={styles.cardRight}>
          <Text style={styles.cardTax}>
            {result.isAgriculture ? "Exempt" : formatPKR(result.finalTax)}
          </Text>
          {!result.isAgriculture && (
            <Text style={styles.cardRate}>
              {(result.effectiveRate * 100).toFixed(1)}% eff.
            </Text>
          )}
        </View>
        <Feather
          name={expanded ? "chevron-up" : "chevron-down"}
          size={16}
          color={c.mutedForeground}
          style={{ marginLeft: 6 }}
        />
      </Pressable>

      {expanded && (
        <>
          <View style={styles.divider} />
          <View style={styles.details}>
            <DRow label="Annual Income" value={formatPKR(state.useMonthly ? parseFloat(state.monthlyIncome) * 12 : parseFloat(state.annualIncome))} />
            {!result.isAgriculture && (
              <>
                <DRow label="Tax before relief" value={formatPKR(result.taxBeforeRelief)} />
                {result.widowRelief > 0 && (
                  <DRow label="Widow relief (50%)" value={`– ${formatPKR(result.widowRelief)}`} accent />
                )}
                <DRow label="Final tax" value={formatPKR(result.finalTax)} bold />
                <DRow label="Take-home" value={formatPKR(result.afterTaxIncome)} accent />
              </>
            )}
          </View>

          {laws.filter((l) => l.isRelief).length > 0 && (
            <>
              <View style={styles.divider} />
              <View style={styles.lawsSection}>
                <Text style={styles.lawsSectionTitle}>Relief applied:</Text>
                {laws.filter((l) => l.isRelief).map((law, i) => (
                  <Text key={i} style={styles.lawItem}>✓ {law.title}</Text>
                ))}
              </View>
            </>
          )}

          <View style={styles.divider} />
          <Pressable
            style={({ pressed }) => [styles.deleteBtn, pressed && { opacity: 0.7 }]}
            onPress={onDelete}
          >
            <Feather name="trash-2" size={14} color={c.destructive} />
            <Text style={styles.deleteBtnText}>Delete</Text>
          </Pressable>
        </>
      )}
    </View>
  );
}

function DRow({ label, value, accent = false, bold = false }: {
  label: string; value: string; accent?: boolean; bold?: boolean;
}) {
  return (
    <View style={styles.dRow}>
      <Text style={styles.dLabel}>{label}</Text>
      <Text style={[
        styles.dValue,
        accent && { color: c.accent },
        bold && { fontFamily: "Inter_700Bold", color: c.foreground },
      ]}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  heading: { fontSize: 28, fontFamily: "Inter_700Bold", color: c.foreground, marginBottom: 2 },
  subheading: { fontSize: 13, fontFamily: "Inter_400Regular", color: c.mutedForeground },
  list: { padding: 16, gap: 10 },
  empty: { alignItems: "center", paddingTop: 80, gap: 10 },
  emptyTitle: { fontSize: 17, fontFamily: "Inter_600SemiBold", color: c.mutedForeground },
  emptyText: {
    fontSize: 14, fontFamily: "Inter_400Regular", color: c.mutedForeground,
    textAlign: "center", lineHeight: 20,
  },
  startBtn: {
    marginTop: 8, paddingVertical: 12, paddingHorizontal: 24,
    borderRadius: colors.radius, backgroundColor: c.primary,
  },
  startBtnText: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: "#FFFFFF" },
  card: {
    backgroundColor: c.card,
    borderRadius: colors.radius + 2,
    borderWidth: 1,
    borderColor: c.border,
    overflow: "hidden",
  },
  cardHeader: { flexDirection: "row", alignItems: "center", padding: 14, gap: 10 },
  cardEmoji: { fontSize: 20, width: 26, textAlign: "center" },
  cardLeft: { flex: 1 },
  cardName: { fontSize: 15, fontFamily: "Inter_700Bold", color: c.foreground },
  cardMeta: { fontSize: 11, fontFamily: "Inter_400Regular", color: c.mutedForeground, marginTop: 2 },
  cardRight: { alignItems: "flex-end" },
  cardTax: { fontSize: 15, fontFamily: "Inter_700Bold", color: c.primary },
  cardRate: { fontSize: 11, fontFamily: "Inter_400Regular", color: c.mutedForeground, marginTop: 2 },
  divider: { height: 1, backgroundColor: c.border, marginHorizontal: 14 },
  details: { padding: 14, gap: 8 },
  dRow: { flexDirection: "row", justifyContent: "space-between" },
  dLabel: { fontSize: 13, fontFamily: "Inter_400Regular", color: c.mutedForeground },
  dValue: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: c.foreground },
  lawsSection: { padding: 14, gap: 4 },
  lawsSectionTitle: {
    fontSize: 12, fontFamily: "Inter_600SemiBold", color: c.mutedForeground,
    textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4,
  },
  lawItem: { fontSize: 13, fontFamily: "Inter_500Medium", color: c.primary },
  deleteBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 6, padding: 12,
  },
  deleteBtnText: { fontSize: 13, fontFamily: "Inter_500Medium", color: c.destructive },
});
