import { Redirect } from "expo-router";
import { useAdmin } from "@/hooks/admin-store";
import { View, ActivityIndicator, StyleSheet } from "react-native";

export default function Index() {
  const { hasCompletedOnboarding, isLoading } = useAdmin();

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  if (!hasCompletedOnboarding) {
    return <Redirect href="/welcome" />;
  }

  return <Redirect href="/exchange" />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
  },
});