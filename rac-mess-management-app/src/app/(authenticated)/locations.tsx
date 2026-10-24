import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../../auth/AuthContext";

type Location = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  landmark?: string | null;
};

type AssignedUser = {
  id: string;
  name: string;
  username: string;
  phone?: string | null;
  location_id?: string | null;
};

// Connect this screen to your existing locations API.
export default function LocationsScreen() {
  const { user } = useAuth();
  const router = useRouter();

  const [locations, setLocations] = useState<Location[]>([]);
  const [users, setUsers] = useState<AssignedUser[]>([]);
  const [selectedLocation, setSelectedLocation] =
    useState<Location | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // The API calls are connected in the next step.
    // Avoid showing this page to non-admin users.
    if (user?.role !== "admin") {
      setLoading(false);
      return;
    }

    // Replace this with your existing location and user API calls.
    setLoading(false);
  }, [user]);

  if (user?.role !== "admin") {
    return (
      <View style={styles.center}>
        <Text>You are not authorized to view this page.</Text>
      </View>
    );
  }

  const assignedUsers = selectedLocation
    ? users.filter(
        (item) => item.location_id === selectedLocation.id
      )
    : [];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Locations</Text>
      <Text style={styles.subtitle}>
        Manage delivery locations and assigned users.
      </Text>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>All Locations</Text>

        {loading ? (
          <ActivityIndicator />
        ) : error ? (
          <Text style={styles.error}>{error}</Text>
        ) : locations.length === 0 ? (
          <Text style={styles.muted}>
            No locations found.
          </Text>
        ) : (
          locations.map((location) => (
            <Pressable
              key={location.id}
              style={[
                styles.locationRow,
                selectedLocation?.id === location.id &&
                  styles.selectedRow,
              ]}
              onPress={() => setSelectedLocation(location)}
            >
              <View style={styles.locationInfo}>
                <Text style={styles.locationName}>
                  {location.name}
                </Text>
                <Text style={styles.muted}>
                  {location.landmark || "No description"}
                </Text>
              </View>

              <Text style={styles.muted}>
                {
                  users.filter(
                    (item) => item.location_id === location.id
                  ).length
                } users
              </Text>
            </Pressable>
          ))
        )}
      </View>

      {selectedLocation && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            {selectedLocation.name}
          </Text>

          <Text style={styles.muted}>
            {selectedLocation.landmark || "No description"}
          </Text>

          <Text style={styles.detailLabel}>Coordinates</Text>
          <Text>
            {selectedLocation.latitude},{" "}
            {selectedLocation.longitude}
          </Text>

          <Text style={styles.detailLabel}>
            Assigned Users ({assignedUsers.length})
          </Text>

          {assignedUsers.length === 0 ? (
            <Text style={styles.muted}>
              No users assigned to this location.
            </Text>
          ) : (
            assignedUsers.map((assignedUser) => (
              <Pressable
                key={assignedUser.id}
                style={styles.userRow}
                onPress={() =>
                  router.push(
                    `/admin/users/${assignedUser.id}` as never
                  )
                }
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.locationName}>
                    {assignedUser.name}
                  </Text>
                  <Text style={styles.muted}>
                    @{assignedUser.username}
                  </Text>
                </View>
                <Text style={styles.link}>View</Text>
              </Pressable>
            ))
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 16,
    paddingBottom: 32,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0F2A4A",
  },
  subtitle: {
    color: "#6B7280",
    marginTop: -8,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F2A4A",
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#D1D5DB",
    gap: 12,
  },
  selectedRow: {
    backgroundColor: "#EFF6FF",
  },
  locationInfo: {
    flex: 1,
    gap: 4,
  },
  locationName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
  },
  muted: {
    fontSize: 13,
    color: "#6B7280",
  },
  error: {
    color: "#B91C1C",
  },
  detailLabel: {
    marginTop: 8,
    fontWeight: "600",
    color: "#374151",
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#D1D5DB",
    gap: 12,
  },
  link: {
    color: "#0F2A4A",
    fontWeight: "600",
  },
});