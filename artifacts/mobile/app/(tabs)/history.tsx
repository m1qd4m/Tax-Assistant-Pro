import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
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
import { FILING_STATUS_LABELS } from "@/constants/taxData";
import { CalculationEntry, useTax } from "@/context/TaxContext";

const c = colors.light;

function formatCurrency(n: number) {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatPercent(n: number) {
  return (n * 100).toFixed(1) + "%";
}

export default function HistoryScreen() {
  const insets = useSafeAreaInsets();
  const { history, deleteHistory, clearHistory } = useTax();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const webTop = Platform.OS === "web" ? 67 : insets.top;
  const webBottom = Platform.OS === "web" ? 34 : 0;

  const handleClear = () => {
    if (Platform.OS === "web") {
      clearHistory();
      return;
    }
    Alert.alert("Clear History", "Remove all saved calculations?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Clear All",
        style: "destructive",
        onPress: () => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          clearHistory();
        },
      },
    ]);
  };

  const handleDelete = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    deleteHistory(id);
  };

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <View
        style={[
          styles.header,
          {
            paddingTop: webTop + 16,
            borderBottomColor: c.border,
          },
        ]}
      >
        <View>
          <Text style={styles.heading}>History</Text>
          <Text style={styles.subheading}>
            {history.length === 0
              ? "No saved calculations"
              : `${history.length} calculation${history.length > 1 ? "s" : ""}`}
          </Text>
        </View>
        {history.length > 0 && (
          <Pressable onPress={handleClear} style={styles.clearBtn}>
            <Text style={styles.clearBtnText}>Clear All</Text>
          </Pressable>
        )}
      </View>

      <FlatList
        data={history}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.list,
          { paddingBottom: webBottom + 120 },
        ]}
        scrollEnabled={!!history.length}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Feather name="clock" size={44} color={c.border} />
            <Text style={styles.emptyTitle}>No calculations yet</Text>
            <Text style={styles.emptyText}>
              Use the Calculator tab and save a result
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <HistoryCard
            entry={item}
            expanded={expandedId === item.id}
            onToggle={() =>
              setExpandedId(expandedId === item.id ? null : item.id)
            }
            onDelete={() => handleDelete(item.id)}
          />
        )}
      />
    </View>
  );
}

function HistoryCard({
  entry,
  expanded,
  onToggle,
  onDelete,
}: {
  entry: CalculationEntry;
  expanded: boolean;
  onToggle: () => void;
  onDelete: () => void;
}) {
  const { result } = entry;
  return (
    <View style={styles.card}>
      <Pressable onPress={onToggle} style={styles.cardHeader}>
        <View style={styles.cardLeft}>
          <Text style={styles.cardIncome}>
            {formatCurrency(entry.grossIncome)}
          </Text>
          <Text style={styles.cardMeta}>
            {FILING_STATUS_LABELS[entry.filingStatus]} · {formatDate(entry.date)}
          </Text>
        </View>
        <View style={styles.cardRight}>
          <Text style={styles.cardTax}>{formatCurrency(result.totalTax)}</Text>
          <Text style={styles.cardRate}>
            {formatPercent(result.effectiveRate)} eff. rate
          </Text>
        </View>
        <Feather
          name={expanded ? "chevron-up" : "chevron-down"}
          size={16}
          color={c.mutedForeground}
          style={{ marginLeft: 8 }}
        />
      </Pressable>

      {expanded && (
        <>
          <View style={styles.divider} />
          <View style={styles.details}>
            <DetailRow label="Taxable Income" value={formatCurrency(result.taxableIncome)} />
            <DetailRow label="Deduction" value={formatCurrency(result.deductionUsed)} />
            <DetailRow label="Federal Tax" value={formatCurrency(result.federalTax)} />
            <DetailRow label="Social Security" value={formatCurrency(result.socialSecurityTax)} />
            <DetailRow label="Medicare" value={formatCurrency(result.medicareTax)} />
            <DetailRow
              label="Take-Home"
              value={formatCurrency(result.afterTaxIncome)}
              highlight
            />
          </View>
          <View style={styles.divider} />
          <Pressable
            style={({ pressed }) => [
              styles.deleteBtn,
              pressed && { opacity: 0.7 },
            ]}
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

function DetailRow({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text
        style={[
          styles.detailValue,
          highlight && { color: c.accent, fontFamily: "Inter_700Bold" },
        ]}
      >
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
  heading: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    color: c.foreground,
    marginBottom: 2,
  },
  subheading: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: c.mutedForeground,
  },
  clearBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  clearBtnText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: c.destructive,
  },
  list: {
    padding: 20,
    gap: 12,
  },
  empty: {
    alignItems: "center",
    paddingTop: 80,
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
  card: {
    backgroundColor: c.card,
    borderRadius: colors.radius + 2,
    borderWidth: 1,
    borderColor: c.border,
    overflow: "hidden",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  cardLeft: { flex: 1 },
  cardIncome: {
    fontSize: 17,
    fontFamily: "Inter_700Bold",
    color: c.foreground,
  },
  cardMeta: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: c.mutedForeground,
    marginTop: 2,
  },
  cardRight: { alignItems: "flex-end" },
  cardTax: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    color: c.foreground,
  },
  cardRate: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: c.mutedForeground,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: c.border,
    marginHorizontal: 16,
  },
  details: {
    padding: 16,
    gap: 10,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  detailLabel: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: c.mutedForeground,
  },
  detailValue: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: c.foreground,
  },
  deleteBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    padding: 12,
  },
  deleteBtnText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: c.destructive,
  },
});
