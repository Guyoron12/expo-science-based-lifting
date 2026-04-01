import { theme } from "@/theme";
import { useNavigation } from "@react-navigation/native";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
type WorkoutHeaderProps = {
  title: string;
  subtitle: string;
};

export default function WorkoutHeader({ title, subtitle }: WorkoutHeaderProps) {
  const navigation = useNavigation();
  return (
    <View style={styles.container}>
      <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
        <Image
          source={require("@/assets/images/white-back-arrow.png")}
          style={styles.backButtonImage}
        />
      </Pressable>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
      <Pressable onPress={() => console.log("menu")} style={styles.menuButton}>
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
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.background.primary,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  backButtonImage: {
    width: 24,
    height: 24,
  },
  titleContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    ...theme.typography.title,
    color: theme.colors.text.primary,
  },
  subtitle: {
    ...theme.typography.body,
    color: theme.colors.text.secondary,
  },
  menuButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  menuButtonImage: {
    width: 24,
    height: 24,
  },
});
