import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import colors from "@/constants/colors";

const c = colors.light;
const TOTAL_STEPS = 5;

interface WizardShellProps {
  step: number;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  canContinue: boolean;
  onContinue: () => void;
  continueLabel?: string;
}

export function WizardShell({
  step,
  title,
  subtitle,
  children,
  canContinue,
  onContinue,
  continueLabel = "Continue",
}: WizardShellProps) {
  const insets = useSafeAreaInsets();
  const webTop = Platform.OS === "web" ? 20 : insets.top;
  const webBottom = Platform.OS === "web" ? 20 : insets.bottom;

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={[styles.container, { backgroundColor: c.background }]}>
        {/* Top bar */}
        <View style={[styles.topBar, { paddingTop: webTop + 8 }]}>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.6 }]}
            hitSlop={12}
          >
            <Feather name="arrow-left" size={22} color={c.foreground} />
          </Pressable>

          <View style={styles.progressDots}>
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  i < step ? styles.dotDone : i === step - 1 ? styles.dotActive : styles.dotInactive,
                ]}
              />
            ))}
          </View>

          <Text style={styles.stepLabel}>{step}/{TOTAL_STEPS}</Text>
        </View>

        {/* Progress bar */}
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${(step / TOTAL_STEPS) * 100}%` as any }]} />
        </View>

        {/* Content */}
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          <View style={styles.content}>{children}</View>
        </ScrollView>

        {/* Continue button */}
        <View style={[styles.footer, { paddingBottom: webBottom + 16 }]}>
          <Pressable
            style={({ pressed }) => [
              styles.continueBtn,
              !canContinue && styles.continueBtnDisabled,
              pressed && canContinue && { opacity: 0.85 },
            ]}
            onPress={onContinue}
            disabled={!canContinue}
          >
            <Text style={[styles.continueBtnText, !canContinue && styles.continueBtnTextDisabled]}>
              {continueLabel}
            </Text>
            {canContinue && <Feather name="arrow-right" size={18} color="#FFFFFF" />}
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1 },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  progressDots: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotDone: { backgroundColor: c.primary },
  dotActive: { backgroundColor: c.primary, width: 20 },
  dotInactive: { backgroundColor: c.border },
  stepLabel: {
    width: 36,
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    color: c.mutedForeground,
    textAlign: "right",
  },
  progressBar: {
    height: 3,
    backgroundColor: c.border,
    marginHorizontal: 0,
  },
  progressFill: {
    height: 3,
    backgroundColor: c.primary,
    borderRadius: 2,
  },
  scroll: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 24,
  },
  title: {
    fontSize: 26,
    fontFamily: "Inter_700Bold",
    color: c.foreground,
    lineHeight: 34,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: c.mutedForeground,
    lineHeight: 22,
    marginBottom: 8,
  },
  content: { marginTop: 28 },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: c.border,
    backgroundColor: c.background,
  },
  continueBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 54,
    borderRadius: colors.radius + 2,
    backgroundColor: c.primary,
  },
  continueBtnDisabled: { backgroundColor: c.border },
  continueBtnText: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: "#FFFFFF",
  },
  continueBtnTextDisabled: { color: c.mutedForeground },
});
