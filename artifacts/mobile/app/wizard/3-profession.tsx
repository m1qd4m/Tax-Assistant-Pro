import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { WizardShell } from "@/components/WizardShell";
import colors from "@/constants/colors";
import { PROFESSION_OPTIONS, ProfessionCategory } from "@/constants/taxData";
import { useWizard } from "@/context/WizardContext";

const c = colors.light;

export default function ProfessionScreen() {
  const { professionCategory, setProfessionCategory, professionOther, setProfessionOther } = useWizard();

  const canContinue =
    !!professionCategory &&
    (professionCategory !== "other" || !!professionOther.trim());

  return (
    <WizardShell
      step={3}
      title="What do you do for work?"
      subtitle="Your profession determines which tax rules apply to you."
      canContinue={canContinue}
      onContinue={() => router.push("/wizard/4-income")}
    >
      <View style={styles.list}>
        {PROFESSION_OPTIONS.map((opt) => {
          const selected = professionCategory === opt.key;
          return (
            <Pressable
              key={opt.key}
              style={({ pressed }) => [
                styles.card,
                selected && styles.cardSelected,
                pressed && !selected && styles.cardPressed,
              ]}
              onPress={() => {
                Haptics.selectionAsync();
                setProfessionCategory(opt.key as ProfessionCategory);
              }}
            >
              <Text style={styles.cardEmoji}>{opt.emoji}</Text>
              <View style={styles.cardText}>
                <Text style={[styles.cardLabel, selected && styles.cardLabelSelected]}>
                  {opt.label}
                </Text>
                <Text style={styles.cardDesc}>{opt.description}</Text>
              </View>
              <View style={[styles.radio, selected && styles.radioSelected]}>
                {selected && <View style={styles.radioDot} />}
              </View>
            </Pressable>
          );
        })}
      </View>

      {professionCategory === "other" && (
        <View style={styles.otherField}>
          <Text style={styles.otherLabel}>Please describe your profession</Text>
          <TextInput
            style={styles.input}
            value={professionOther}
            onChangeText={setProfessionOther}
            placeholder="e.g. Fashion designer, carpenter..."
            placeholderTextColor={c.mutedForeground}
            autoCapitalize="words"
          />
        </View>
      )}

      {professionCategory === "it_freelancer" && (
        <View style={styles.specialNote}>
          <Text style={styles.specialNoteTitle}>💡 Great news for IT freelancers</Text>
          <Text style={styles.specialNoteText}>
            Income from foreign clients for IT services is taxed at only 0.25% (final tax) under SRO 586(I)/2023 — one of the lowest rates available.
          </Text>
        </View>
      )}

      {professionCategory === "farmer_agriculture" && (
        <View style={styles.specialNote}>
          <Text style={styles.specialNoteTitle}>💡 Agricultural income is federal exempt</Text>
          <Text style={styles.specialNoteText}>
            Farm income is exempt from federal income tax under Section 41, ITO 2001. However, your province may levy Agricultural Income Tax separately.
          </Text>
        </View>
      )}
    </WizardShell>
  );
}

const styles = StyleSheet.create({
  list: { gap: 8, marginBottom: 16 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: colors.radius,
    borderWidth: 1.5,
    borderColor: c.border,
    backgroundColor: c.card,
    padding: 14,
    gap: 12,
  },
  cardSelected: {
    borderColor: c.primary,
    backgroundColor: c.secondary,
  },
  cardPressed: { opacity: 0.8 },
  cardEmoji: { fontSize: 24, width: 32, textAlign: "center" },
  cardText: { flex: 1 },
  cardLabel: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: c.foreground,
  },
  cardLabelSelected: { color: c.primary },
  cardDesc: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: c.mutedForeground,
    marginTop: 2,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: c.border,
    alignItems: "center",
    justifyContent: "center",
  },
  radioSelected: { borderColor: c.primary },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: c.primary,
  },
  otherField: { marginTop: 4, marginBottom: 16 },
  otherLabel: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: c.mutedForeground,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 8,
  },
  input: {
    height: 52,
    borderRadius: colors.radius,
    borderWidth: 1.5,
    borderColor: c.border,
    backgroundColor: c.card,
    paddingHorizontal: 16,
    fontSize: 16,
    fontFamily: "Inter_500Medium",
    color: c.foreground,
  },
  specialNote: {
    backgroundColor: c.secondary,
    borderRadius: colors.radius,
    padding: 14,
    borderWidth: 1,
    borderColor: c.primary,
    marginBottom: 12,
  },
  specialNoteTitle: {
    fontSize: 14,
    fontFamily: "Inter_700Bold",
    color: c.primary,
    marginBottom: 4,
  },
  specialNoteText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: c.foreground,
    lineHeight: 19,
  },
});
