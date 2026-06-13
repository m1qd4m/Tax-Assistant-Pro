import React from "react";
import {
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";

import colors from "@/constants/colors";

const c = colors.light;

interface ChoiceCardProps {
  emoji?: string;
  label: string;
  description?: string;
  selected: boolean;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  horizontal?: boolean;
  compact?: boolean;
}

export function ChoiceCard({
  emoji,
  label,
  description,
  selected,
  onPress,
  style,
  horizontal = false,
  compact = false,
}: ChoiceCardProps) {
  if (compact) {
    return (
      <Pressable
        style={({ pressed }) => [
          styles.chip,
          selected && styles.chipSelected,
          pressed && !selected && { opacity: 0.7 },
          style,
        ]}
        onPress={onPress}
      >
        <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
          {label}
        </Text>
      </Pressable>
    );
  }

  if (horizontal) {
    return (
      <Pressable
        style={({ pressed }) => [
          styles.cardH,
          selected && styles.cardSelected,
          pressed && !selected && { opacity: 0.8 },
          style,
        ]}
        onPress={onPress}
      >
        {emoji ? <Text style={styles.emojiH}>{emoji}</Text> : null}
        <View style={styles.textH}>
          <Text style={[styles.labelH, selected && styles.labelSelected]}>
            {label}
          </Text>
          {description ? (
            <Text style={styles.descH}>{description}</Text>
          ) : null}
        </View>
        <View style={[styles.radio, selected && styles.radioSelected]}>
          {selected && <View style={styles.radioDot} />}
        </View>
      </Pressable>
    );
  }

  return (
    <Pressable
      style={({ pressed }) => [
        styles.cardV,
        selected && styles.cardSelected,
        pressed && !selected && { opacity: 0.8 },
        style,
      ]}
      onPress={onPress}
    >
      {emoji ? <Text style={styles.emojiV}>{emoji}</Text> : null}
      <Text style={[styles.labelV, selected && styles.labelSelected]}>
        {label}
      </Text>
      {description ? (
        <Text style={styles.descV}>{description}</Text>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  cardH: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: colors.radius,
    borderWidth: 1.5,
    borderColor: c.border,
    backgroundColor: c.card,
    padding: 14,
  },
  cardV: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: colors.radius,
    borderWidth: 1.5,
    borderColor: c.border,
    backgroundColor: c.card,
    paddingVertical: 16,
    paddingHorizontal: 10,
  },
  cardSelected: {
    borderColor: c.primary,
    backgroundColor: c.secondary,
  },
  emojiH: { fontSize: 22, width: 28, textAlign: "center" },
  emojiV: { fontSize: 28, marginBottom: 6 },
  textH: { flex: 1 },
  labelH: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: c.foreground,
  },
  labelV: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: c.foreground,
    textAlign: "center",
  },
  labelSelected: { color: c.primary },
  descH: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: c.mutedForeground,
    marginTop: 2,
  },
  descV: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: c.mutedForeground,
    marginTop: 3,
    textAlign: "center",
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
  chip: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 100,
    borderWidth: 1.5,
    borderColor: c.border,
    backgroundColor: c.card,
    alignItems: "center",
    justifyContent: "center",
  },
  chipSelected: {
    backgroundColor: c.secondary,
    borderColor: c.primary,
  },
  chipText: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: c.mutedForeground,
  },
  chipTextSelected: { color: c.primary },
});
