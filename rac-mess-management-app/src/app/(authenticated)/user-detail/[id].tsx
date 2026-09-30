import {
  View,
  Text,
  ScrollView,
  Pressable,
} from "react-native";
import {
  useLocalSearchParams,
  useRouter,
} from "expo-router";
import { useEffect, useState } from "react";

import { useAuth } from "../../../auth/AuthContext";
import {
  getBattalionUsers,
  type User,
} from "../../../api/admin";

import { styles } from "../../../user/styles/user-detail.styles";

export default function UserDetailScreen() {
  const router = useRouter();

  const { id } = useLocalSearchParams<{ id: string }>();
  const { accessToken, logout } = useAuth();

  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    async function loadUser() {
      if (!accessToken || !id) {
        return;
      }

      try {
        const users = await getBattalionUsers(accessToken);

        const selectedUser = users.find(
          (person) => person.id === id
        );

        setUser(selectedUser ?? null);
      } catch (error) {
        console.error("Failed to load user:", error);
      }
    }

    loadUser();
  }, [accessToken, id]);

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>
          User not found.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>User Details</Text>
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
        </View>

        <Pressable
          style={styles.backButton}
          onPress={() => router.replace("/(authenticated)/users")}
        >
          <Text style={styles.backText}>
            Back
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}