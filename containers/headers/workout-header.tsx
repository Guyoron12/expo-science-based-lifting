import { hudColors, hudMotion, hudShadow, hudTypography, theme } from "@/theme";
import { useNavigation } from "@react-navigation/native";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type WorkoutHeaderProps = {
  title: string;
  subtitle: string;
};

export default function WorkoutHeader({ title, subtitle }: WorkoutHeaderProps) {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[styles.container, { paddingTop: insets.top + theme.spacing.lg }]}
    >
      <Pressable
        onPress={() => navigation.goBack()}
        style={({ pressed }) => [
          styles.iconButton,
          pressed && styles.iconButtonPressed,
        ]}
      >
        <Image
          source={require("@/assets/images/white-back-arrow.png")}
          style={styles.backButtonImage}
        />
      </Pressable>
      <View style={styles.titleContainer}>
        <Text style={styles.kicker}>Protocol</Text>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
      <Pressable
        onPress={() => console.log("menu")}
        style={({ pressed }) => [
          styles.iconButton,
          pressed && styles.iconButtonPressed,
        ]}
      >
        <Image
          source={require("@/assets/images/menu-icon.png")}
          style={styles.menuButtonImage}
        />
      </Pressable>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
    backgroundColor: hudColors.backgroundSecondary,
    borderBottomWidth: 1,
    borderBottomColor: hudColors.borderGreen,
    ...hudShadow.card,
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: hudColors.border,
    borderRadius: 999,
    backgroundColor: hudColors.surfaceGlass,
  },
  iconButtonPressed: {
    transform: [{ scale: hudMotion.pressScale }],
    borderColor: hudColors.accent,
    shadowColor: hudColors.accent,
    shadowOpacity: 0.26,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
  },
  backButtonImage: {
    width: 24,
    height: 24,
    tintColor: hudColors.accent,
  },
  titleContainer: {
    justifyContent: "center",
    alignItems: "center",
    gap: 2,
  },
  kicker: {
    fontFamily: theme.fonts.bold,
    fontSize: 10,
    fontWeight: "700",
    color: hudColors.accent,
    ...hudTypography.labelWide,
  },
  title: {
    ...theme.typography.title,
    color: hudColors.textPrimary,
    ...hudTypography.headingTight,
  },
  subtitle: {
    ...theme.typography.body,
    color: hudColors.textSecondary,
    ...hudTypography.mono,
  },
  menuButtonImage: {
    width: 24,
    height: 24,
    tintColor: hudColors.accent,
  },
});
