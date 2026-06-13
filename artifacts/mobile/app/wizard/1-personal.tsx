import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";

import { WizardShell } from "@/components/WizardShell";
import colors from "@/constants/colors";
import { Gender, useWizard } from "@/context/WizardContext";
import { ChoiceCard } from "@/components/ChoiceCard";

const c = colors.light;

const GENDERS: { key: Gender; emoji: string; label: string }[] = [
  { key: "male", emoji: "👨", label: "Male" },
  { key: "female", emoji: "👩", label: "Female" },
  { key: "other", emoji: "🧑", label: "Other / Prefer not to say" },
];

export default function PersonalScreen() {
  const { name, setName, gender, setGender, age, setAge } = useWizard();

  const ageNum = parseInt(age, 10);
  const ageValid = !!age && ageNum >= 1 && ageNum <= 120;
  const canContinue = !!name.trim() && !!gender && ageValid;

  const isMinor = ageValid && ageNum < 18;

  const handleContinue = () => {
    router.push("/wizard/2-family");
  };

  return (
    <WizardShell
      step={1}
      title="Let's get to know you"
      subtitle="This helps us calculate your correct tax under Pakistani law."
      canContinue={canContinue}
      onContinue={handleContinue}
    >
      {/* Name */}
      <View style={styles.field}>
        <Text style={styles.fieldLabel}>Your name</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="e.g. Fatima Ahmed"
          placeholderTextColor={c.mutedForeground}
          autoCapitalize="words"
          returnKeyType="done"
        />
      </View>

      {/* Gender */}
      <View style={styles.field}>
        <Text style={styles.fieldLabel}>Gender</Text>
        <View style={styles.cardRow}>
          {GENDERS.map((g) => (
            <ChoiceCard
              key={g.key}
              emoji={g.emoji}
              label={g.label}
              selected={gender === g.key}
              onPress={() => {
                Haptics.selectionAsync();
                setGender(g.key);
              }}
              style={styles.genderCard}
            />
          ))}
        </View>
      </View>

      {/* Age */}
      <View style={styles.field}>
        <Text style={styles.fieldLabel}>Age</Text>
        <TextInput
          style={[styles.input, styles.ageInput]}
          value={age}
          onChangeText={(t) => setAge(t.replace(/[^0-9]/g, ""))}
          placeholder="e.g. 35"
          placeholderTextColor={c.mutedForeground}
          keyboardType="numeric"
          maxLength={3}
          returnKeyType="done"
        />
        {isMinor && (
          <View style={styles.noticeCard}>
            <Text style={styles.noticeTitle}>⚠️ Minor Person</Text>
            <Text style={styles.noticeText}>
              Under Pakistani tax law (Section 87, ITO 2001), income earned by a person under 18 is generally combined with their parents' income. You may not need to file taxes independently.
            </Text>
          </View>
        )}
      </View>
    </WizardShell>
  );
}

const styles = StyleSheet.create({
  field: { marginBottom: 20 },
  fieldLabel: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: c.mutedForeground,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 10,
  },
  input: {
    height: 46,
    borderRadius: colors.radius,
    borderWidth: 1.5,
    borderColor: c.border,
    backgroundColor: c.card,
    paddingHorizontal: 16,
    fontSize: 15,
    fontFamily: "Inter_500Medium",
    color: c.foreground,
  },
  ageInput: { width: 110 },
  cardRow: { gap: 8, flexDirection: "row" },
  genderCard: { flex: 1 },
  noticeCard: {
    marginTop: 12,
    backgroundColor: colors.light.warningLight,
    borderRadius: colors.radius,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.light.warning,
  },
  noticeTitle: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: colors.light.warning,
    marginBottom: 4,
  },
  noticeText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: c.foreground,
    lineHeight: 19,
  },
});
