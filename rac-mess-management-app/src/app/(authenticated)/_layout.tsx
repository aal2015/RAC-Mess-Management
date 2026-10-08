import {
  View,
  Pressable,
  Text,
} from "react-native";
import { Tabs, Redirect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../auth/AuthContext";

export default function AuthenticatedLayout() {
  const {
    isAuthenticated,
    isLoading,
    user,
    logout,
  } = useAuth();

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  const isAdmin = user?.role === "admin";

  const isUserOrDriver =
    user?.role === "user" ||
    user?.role === "driver";

  return (
    <View style={{ flex: 1 }}>
      {/* <View style={styles.logoutBar}>
        <View />

        <Pressable
          style={styles.logoutButton}
          onPress={logout}
          accessibilityLabel="Logout"
        >
          <Ionicons
            name="log-out-outline"
            size={22}
            color="#FFFFFF"
          />

          <Text style={styles.logoutText}>
            Logout
          </Text>
        </Pressable>
      </View> */}

      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: "#0F2A4A",
          tabBarInactiveTintColor: "#6B7280",
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarIcon: ({ color, size }) => (
              <Ionicons
                name="home"
                size={size}
                color={color}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="calendar"
          options={{
            href: isUserOrDriver
              ? "/calendar"
              : null,
            title: "Calendar",
            tabBarIcon: ({ color, size }) => (
              <Ionicons
                name="calendar"
                size={size}
                color={color}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="users"
          options={{
            href: isAdmin
              ? "/users"
              : null,
            title: "Users",
            tabBarIcon: ({ color, size }) => (
              <Ionicons
                name="people"
                size={size}
                color={color}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="routes"
          options={{
            href: isAdmin
              ? "/routes"
              : null,
            title: "Routes",
            tabBarIcon: ({ color, size }) => (
              <Ionicons
                name="people"
                size={size}
                color={color}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="directory"
          options={{
            href: isUserOrDriver
              ? "/directory"
              : null,
            title: "Directory",
            tabBarIcon: ({ color, size }) => (
              <Ionicons
                name="book"
                size={size}
                color={color}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="more"
          options={{
            title: "More",
            tabBarIcon: ({ color, size }) => (
              <Ionicons
                name="menu"
                size={size}
                color={color}
              />
            ), href: null
          }}
        />

        <Tabs.Screen
          name="booking"
          options={{ href: null }}
        />

        <Tabs.Screen
          name="add-user"
          options={{ href: null }}
        />

        <Tabs.Screen
          name="user-detail/[id]"
          options={{ href: null }}
        />

        <Tabs.Screen
          name="meal-management"
          // options={{
          //   href: isAdmin
          //     ? "/meal-management"
          //     : null,
          // }}
          options={{ href: null }}
        />

        <Tabs.Screen
          name="location/[id]"
          options={{ href: null }}
        />
      </Tabs>
    </View>
  );
}

const styles = {
  logoutBar: {
    width: "100%",
    height: 48,
    backgroundColor: "#0F2A4A",
    paddingHorizontal: 16,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "flex-end" as const,
  },

  logoutButton: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },

  logoutText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600" as const,
  },
};