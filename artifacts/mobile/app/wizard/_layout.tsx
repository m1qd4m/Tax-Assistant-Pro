import { Stack } from "expo-router";

export default function WizardLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: "slide_from_right" }}>
      <Stack.Screen name="1-personal" />
      <Stack.Screen name="2-family" />
      <Stack.Screen name="3-profession" />
      <Stack.Screen name="4-income" />
      <Stack.Screen name="5-results" />
    </Stack>
  );
}
