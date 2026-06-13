import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React from "react";
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
  if (n >= 100000) return "₨ " + (n / 100000).toFixed(1) + " Lac";
  return "₨ " + Math.round(n).toLocaleString("en-US");
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-PK", {
    month: "short", day: "numeric", year: "numeric",
  });
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { savedHistory, resetWizard, deleteResult } = useWizard();

  const webTop = Platform.OS === "web" ? 67 : insets.top;
  const webBottom = Platform.OS === "web" ? 34 : 0;

  const handleStart = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    resetWizard();
    router.push("/wizard/1-personal");
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: c.background }]}
      contentContainerStyle={[
        styles.scroll,
        { paddingTop: webTop + 12, paddingBottom: webBottom + 100 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero */}
      <View style={styles.hero}>
        <View style={styles.logoBox}>
          <Text style={styles.logoText}>₨</Text>
        </View>
        <Text style={styles.appName}>Tax Helper</Text>
        <Text style={styles.appTagline}>Pakistan FBR · Tax Year 2024–25</Text>
      </View>

      {/* Start card */}
      <Pressable
        style={({ pressed }) => [styles.startCard, pressed && { opacity: 0.9 }]}
        onPress={handleStart}
      >
        <View style={styles.startCardLeft}>
          <Text style={styles.startCardTitle}>Calculate Your Tax</Text>
          <Text style={styles.startCardSub}>
            Answer a few simple questions and get your personalised tax estimate with applicable Pakistani tax laws.
          </Text>
          <View style={styles.startSteps}>
            {["Personal info", "Family status", "Profession", "Income", "Results"].map(
              (step, i) => (
                <View key={i} style={styles.startStep}>
                  <View style={styles.startStepDot} />
                  <Text style={styles.startStepText}>{step}</Text>
                </View>
              )
            )}
          </View>
        </View>
        <View style={styles.startCardBtn}>
          <Feather name="arrow-right" size={22} color="#FFFFFF" />
        </View>
      </Pressable>

      {/* Features */}
      <View style={styles.features}>
        <FeatureItem icon="shield" text="Widow 50% relief automatically applied" />
        <FeatureItem icon="zap" text="IT freelancer 0.25% final tax" />
        <FeatureItem icon="sun" text="Agricultural income federal exemption" />
        <FeatureItem icon="book-open" text="Relevant FBR laws explained in plain language" />
      </View>

      {/* Recent history */}
      {savedHistory.length > 0 && (
        <View style={styles.historySection}>
          <Text style={styles.historySectionTitle}>Recent Calculations</Text>
          {savedHistory.slice(0, 3).map((entry) => {
            const prof = PROFESSION_OPTIONS.find((p) => p.key === entry.state.professionCategory);
            return (
              <View key={entry.id} style={styles.historyItem}>
                <Text style={styles.historyEmoji}>{prof?.emoji ?? "₨"}</Text>
                <View style={styles.historyItemText}>
                  <Text style={styles.historyName}>{entry.state.name || "Unnamed"}</Text>
                  <Text style={styles.historyMeta}>
                    {prof?.label ?? "–"} · {formatDate(entry.date)}
                  </Text>
                </View>
                <Text style={styles.historyTax}>
                  {entry.result.isAgriculture ? "Exempt" : formatPKR(entry.result.finalTax)}
                </Text>
              </View>
            );
          })}
          {savedHistory.length > 3 && (
            <Text style={styles.moreHistory}>
              +{savedHistory.length - 3} more in History tab
            </Text>
          )}
        </View>
      )}

      <View style={styles.fbrNote}>
        <Text style={styles.fbrNoteText}>
          File your return at <Text style={styles.fbrLink}>iris.fbr.gov.pk</Text> by September 30, 2025
        </Text>
      </View>
    </ScrollView>
  );
}

function FeatureItem({ icon, text }: { icon: any; text: string }) {
  return (
    <View style={styles.featureItem}>
      <View style={styles.featureIcon}>
        <Feather name={icon} size={15} color={c.primary} />
      </View>
      <Text style={styles.featureText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 20 },

  hero: { alignItems: "center", paddingVertical: 28 },
  logoBox: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: c.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  logoText: { fontSize: 28, fontFamily: "Inter_700Bold", color: "#FFFFFF" },
  appName: { fontSize: 26, fontFamily: "Inter_700Bold", color: c.foreground },
  appTagline: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: c.mutedForeground,
    marginTop: 4,
  },

  startCard: {
    backgroundColor: c.primary,
    borderRadius: colors.radius + 4,
    padding: 20,
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 20,
    gap: 16,
  },
  startCardLeft: { flex: 1 },
  startCardTitle: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    color: "#FFFFFF",
    marginBottom: 6,
  },
  startCardSub: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.8)",
    lineHeight: 19,
    marginBottom: 16,
  },
  startSteps: { gap: 6 },
  startStep: { flexDirection: "row", alignItems: "center", gap: 8 },
  startStepDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.6)",
  },
  startStepText: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    color: "rgba(255,255,255,0.85)",
  },
  startCardBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },

  features: {
    backgroundColor: c.card,
    borderRadius: colors.radius + 2,
    borderWidth: 1,
    borderColor: c.border,
    padding: 16,
    gap: 12,
    marginBottom: 20,
  },
  featureItem: { flexDirection: "row", alignItems: "center", gap: 12 },
  featureIcon: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: c.secondary,
    alignItems: "center",
    justifyContent: "center",
  },
  featureText: {
    flex: 1,
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: c.foreground,
    lineHeight: 19,
  },

  historySection: { marginBottom: 20 },
  historySectionTitle: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    color: c.foreground,
    marginBottom: 10,
  },
  historyItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: c.card,
    borderRadius: colors.radius,
    borderWidth: 1,
    borderColor: c.border,
    padding: 12,
    marginBottom: 8,
  },
  historyEmoji: { fontSize: 20, width: 28, textAlign: "center" },
  historyItemText: { flex: 1 },
  historyName: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: c.foreground },
  historyMeta: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: c.mutedForeground,
    marginTop: 2,
  },
  historyTax: {
    fontSize: 14,
    fontFamily: "Inter_700Bold",
    color: c.primary,
  },
  moreHistory: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: c.mutedForeground,
    textAlign: "center",
    paddingTop: 4,
  },

  fbrNote: {
    backgroundColor: c.muted,
    borderRadius: colors.radius,
    padding: 12,
  },
  fbrNoteText: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: c.mutedForeground,
    textAlign: "center",
    lineHeight: 18,
  },
  fbrLink: { fontFamily: "Inter_600SemiBold", color: c.primary },
});
