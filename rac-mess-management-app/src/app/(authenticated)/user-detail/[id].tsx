
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator
} from "react-native";

import {
  useLocalSearchParams,
  useRouter,
} from "expo-router";

import { useEffect, useState } from "react";

import LogoutButton from "../../../components/LogoutButton";
import UserLocation from "@/components/UserLocation/UserLocation";

import { useAuth } from "../../../auth/AuthContext";

import {
  getBattalionUsers,
  type User,
} from "../../../api/admin";

import { styles } from "../../../user/styles/user-detail.styles";

export default function UserDetailScreen() {
  const router = useRouter();

  const { id } = useLocalSearchParams<{ id: string }>();
  const { accessToken } = useAuth();

  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const isAdmin = useAuth().user?.role === "admin";

  useEffect(() => {
    async function loadUser() {
      if (!accessToken || !id) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setLoadError(null);

        const users = await getBattalionUsers(accessToken);

        const selectedUser = users.find(
          (person) => person.id === id
        );

        setUser(selectedUser ?? null);

        if (!selectedUser) {
          setLoadError("User not found.");
        }
      } catch (error) {
        console.error("Failed to load user:", error);

        setLoadError(
          error instanceof Error
            ? error.message
            : "Failed to load user."
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadUser();
  }, [accessToken, id]);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (loadError || !user) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>
          {loadError ?? "User not found."}
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>User Details</Text>
        <LogoutButton />
      </View>

      <View style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.label}>Name</Text>
          <Text style={styles.value}>{user.name}</Text>

          <Text style={styles.label}>Username</Text>
          <Text style={styles.value}>{user.username}</Text>

          <Text style={styles.label}>Phone</Text>
          <Text style={styles.value}>
            {user.phone ?? "-"}
          </Text>

          <Text style={styles.label}>Role</Text>
          <Text style={styles.value}>{user.role}</Text>

          <Text style={styles.label}>Battalion</Text>
          <Text style={styles.value}>
            {user.battalion ?? "-"}
          </Text>

          <Text style={styles.label}>Bus</Text>
          <Text style={styles.value}>
            {user.bus ?? "-"}
          </Text>

          <Text style={styles.label}>Status</Text>
          <Text style={styles.value}>
            {user.is_active ? "Active" : "Inactive"}
          </Text>

          <UserLocation
            user={user}
            isAdmin={isAdmin}
          />
        </View>

        <Pressable
          style={styles.backButton}
          onPress={() => router.replace("/(authenticated)/users")}
        >
          <Text style={styles.backText}>Back</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
