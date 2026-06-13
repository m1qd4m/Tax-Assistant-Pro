import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { ChoiceCard } from "@/components/ChoiceCard";
import { WizardShell } from "@/components/WizardShell";
import colors from "@/constants/colors";
import { MaritalStatus, useWizard } from "@/context/WizardContext";

const c = colors.light;

const MARITAL_OPTIONS: {
  key: MaritalStatus;
  emoji: string;
  label: string;
  description: string;
}[] = [
  { key: "single", emoji: "🙂", label: "Single", description: "Never married" },
  { key: "married", emoji: "💍", label: "Married", description: "Currently married" },
  { key: "widow", emoji: "🕊️", label: "Widow / Widower", description: "Spouse has passed away" },
  { key: "divorced", emoji: "📋", label: "Divorced", description: "Marriage legally ended" },
];

const DEPENDENT_OPTIONS = ["0", "1", "2", "3", "4", "5+"];
const CHILDREN_OPTIONS = ["0", "1", "2", "3", "4", "5+"];

export default function FamilyScreen() {
  const {
    gender,
    maritalStatus, setMaritalStatus,
    isHeadOfHousehold, setIsHeadOfHousehold,
    childrenUnder18, setChildrenUnder18,
  } = useWizard();

  const isWidow = maritalStatus === "widow";
  const isFemaleOrOther = gender === "female" || gender === "other";
  const showWidowExtras = isWidow && isFemaleOrOther;

  const canContinue = !!maritalStatus;

  return (
    <WizardShell
      step={2}
      title="Your family situation"
      subtitle="This determines any special tax relief you may be entitled to."
      canContinue={canContinue}
      onContinue={() => router.push("/wizard/3-profession")}
    >
      {/* Marital Status */}
      <View style={styles.field}>
        <Text style={styles.fieldLabel}>Marital status</Text>
        <View style={styles.cardList}>
          {MARITAL_OPTIONS.map((opt) => (
            <ChoiceCard
              key={opt.key}
              emoji={opt.emoji}
              label={opt.label}
              description={opt.description}
              selected={maritalStatus === opt.key}
              onPress={() => {
                Haptics.selectionAsync();
                setMaritalStatus(opt.key);
              }}
              horizontal
            />
          ))}
        </View>
      </View>

      {/* Widow extras — only for female/other who are widows */}
      {showWidowExtras && (
        <>
          <View style={styles.reliefBanner}>
            <Text style={styles.reliefTitle}>🎉 You qualify for widow tax relief!</Text>
            <Text style={styles.reliefText}>
              Under Clause 1(A), Part III, Second Schedule of the Income Tax Ordinance 2001, widows receive a 50% rebate on their computed income tax.
            </Text>
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Are you the main earner for your family?</Text>
            <View style={styles.cardRow}>
              <ChoiceCard
                emoji="✅"
                label="Yes"
                description="I support my family"
                selected={isHeadOfHousehold}
                onPress={() => {
                  Haptics.selectionAsync();
                  setIsHeadOfHousehold(true);
                }}
                style={styles.halfCard}
              />
              <ChoiceCard
                emoji="🙅"
                label="No"
                description="Someone else provides"
                selected={!isHeadOfHousehold}
                onPress={() => {
                  Haptics.selectionAsync();
                  setIsHeadOfHousehold(false);
                }}
                style={styles.halfCard}
              />
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Children under 18 in your care</Text>
            <Text style={styles.hint}>
              Children under 18 cannot file taxes independently — their income (if any) is combined with yours under Section 87 ITO 2001.
            </Text>
            <View style={styles.chipRow}>
              {CHILDREN_OPTIONS.map((opt) => (
                <ChoiceCard
                  key={opt}
                  label={opt}
                  selected={childrenUnder18 === opt}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setChildrenUnder18(opt);
                  }}
                  style={styles.chip}
                  compact
                />
              ))}
            </View>
          </View>
        </>
      )}

      {!showWidowExtras && maritalStatus && (
        <View style={styles.infoCard}>
          <Text style={styles.infoText}>
            {maritalStatus === "married"
              ? "Married individuals are taxed individually in Pakistan. Joint filing is not available."
              : maritalStatus === "single"
              ? "Single persons follow standard tax rates with no additional special provisions."
              : "Divorced individuals are taxed as single persons under standard FBR rates."}
          </Text>
        </View>
      )}
    </WizardShell>
  );
}

const styles = StyleSheet.create({
  field: { marginBottom: 28 },
  fieldLabel: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: c.mutedForeground,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 10,
  },
  hint: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: c.mutedForeground,
    marginBottom: 12,
    lineHeight: 19,
  },
  cardList: { gap: 8 },
  cardRow: { flexDirection: "row", gap: 8 },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  halfCard: { flex: 1 },
  chip: { minWidth: 52 },
  reliefBanner: {
    backgroundColor: c.secondary,
    borderRadius: colors.radius,
    padding: 16,
    borderWidth: 1.5,
    borderColor: c.primary,
    marginBottom: 28,
  },
  reliefTitle: {
    fontSize: 15,
    fontFamily: "Inter_700Bold",
    color: c.primary,
    marginBottom: 6,
  },
  reliefText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: c.foreground,
    lineHeight: 19,
  },
  infoCard: {
    backgroundColor: c.muted,
    borderRadius: colors.radius,
    padding: 14,
  },
  infoText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: c.mutedForeground,
    lineHeight: 19,
  },
});
