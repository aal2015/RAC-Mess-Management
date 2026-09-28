import { Redirect } from "expo-router";
import { View, Text } from "react-native";
import { useAuth } from "../auth/AuthContext";
import HomeScreen from "../user/screens/HomeScreen";

export default function Index() {
  const { isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <View>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  return <HomeScreen />;
}