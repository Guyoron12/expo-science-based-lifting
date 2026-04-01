import {
  Inter_400Regular,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";

/**
 * Map passed to `useFonts` from expo-font. Only include weights used in
 * `theme.typography` so Metro bundles minimal TTFs.
 */
export const interFontSources = {
  Inter_400Regular,
  Inter_600SemiBold,
  Inter_700Bold,
} as const;

/** React Native `fontFamily` names (keys must match `interFontSources`). */
export const fonts = {
  regular: "Inter_400Regular",
  semiBold: "Inter_600SemiBold",
  bold: "Inter_700Bold",
} as const;

export type AppFonts = typeof fonts;
