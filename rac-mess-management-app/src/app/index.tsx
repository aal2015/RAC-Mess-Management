import { Redirect } from "expo-router";
import { View, Text, Button } from "react-native";
import { useAuth } from "../auth/AuthContext";

export default function Index() {
  const { isLoading, isAuthenticated, logout } = useAuth();

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

  return (
    <View>
      <Text>RAC Mess Management</Text>

      <Button
        title="Logout"
        onPress={logout}
      />
    </View>
  );
}