import { theme } from "@/theme";
import { useNavigation } from "@react-navigation/native";
import { useLayoutEffect } from "react";
import { StyleSheet, View } from "react-native";
import ProgressHeader from "./header";

export default function ProgressContainer() {
  const navigation = useNavigation();
  useLayoutEffect(() => {
    navigation.setOptions({
      header: () => <ProgressHeader />,
    });
  }, []);
  return <View style={styles.container}></View>;
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
});
