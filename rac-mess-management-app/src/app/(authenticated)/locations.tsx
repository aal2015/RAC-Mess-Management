
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
import {
  getLocations,
  type Location,
} from "@/api/location";
import {
  getBattalionUsersWithLocations,
  type UserWithLocation,
} from "@/api/users";

export default function LocationsScreen() {
  const { user, accessToken } = useAuth();
  const router = useRouter();

  const [locations, setLocations] = useState<Location[]>([]);
  const [users, setUsers] = useState<UserWithLocation[]>([]);
  const [selectedLocation, setSelectedLocation] =
    useState<Location | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.role !== "admin" || !accessToken) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function loadData() {
      setLoading(true);
      setError(null);

      try {
        const [locationData, userData] = await Promise.all([
          getLocations(accessToken!),
          getBattalionUsersWithLocations(accessToken!),
        ]);

        if (cancelled) return;

        // Keep one record per location.
        setLocations(locationData);

        // The backend joins users with routes, so one user may
        // occur more than once in the response.
        const uniqueUsers = Array.from(
          new Map(
            userData.map((item) => [item.id, item])
          ).values()
        );

        setUsers(uniqueUsers);

        // Keep the selected location current after refreshing.
        setSelectedLocation((previous) =>
          previous
            ? locationData.find(
                (location) => location.id === previous.id
              ) ?? null
            : null
        );
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load locations"
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      cancelled = true;
    };
  }, [user?.role, accessToken]);

  if (user?.role !== "admin") {
    return (
      <View style={styles.center}>
        <Text>You are not authorized to view this page.</Text>
      </View>
    );
  }

  const assignedUsers = selectedLocation
    ? users.filter(
        (item) => item.location?.id === selectedLocation.id
      )
    : [];

  const getLocationLabel = (location: Location) =>
    location.road_name || "Unnamed location";

  const getAssignedCount = (location: Location) =>
    users.filter(
      (item) => item.location?.id === location.id
    ).length;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Locations</Text>
      <Text style={styles.subtitle}>
        Manage delivery locations and assigned users.
      </Text>

      <View style={styles.card}>
        <View style={styles.sectionHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.sectionTitle}>
              All Locations
            </Text>
            <Text style={styles.muted}>
              {locations.length} locations
            </Text>
          </View>
        </View>

        {loading ? (
          <ActivityIndicator color="#0F2A4A" />
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
                  {getLocationLabel(location)}
                </Text>
                <Text style={styles.muted}>
                  {location.latitude}, {location.longitude}
                </Text>
              </View>

              <Text style={styles.muted}>
                {getAssignedCount(location)} users
              </Text>
            </Pressable>
          ))
        )}
      </View>

      {selectedLocation && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            {getLocationLabel(selectedLocation)}
          </Text>

          <Text style={styles.muted}>
            Coordinates: {selectedLocation.latitude},{" "}
            {selectedLocation.longitude}
          </Text>

          <Text style={styles.detailLabel}>
            Assigned Users ({assignedUsers.length})
          </Text>

          {loading ? (
            <ActivityIndicator color="#0F2A4A" />
          ) : assignedUsers.length === 0 ? (
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
                  {assignedUser.phone && (
                    <Text style={styles.muted}>
                      {assignedUser.phone}
                    </Text>
                  )}
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
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
