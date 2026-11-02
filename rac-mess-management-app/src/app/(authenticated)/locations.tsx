
import { useCallback, useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { useAuth } from "../../auth/AuthContext";
import {
  getLocations,
  type Location,
  type UserWithLocation,
} from "@/api/location";
import LocationDetails from "@/components/location/LocationDetails";
import { getBattalionUsersWithLocations } from "@/api/users";
import DataTable from "@/components/DataTable/DataTable";
import type { DataTableColumn } from "@/components/DataTable/types";
import LogoutButton from "../../components/LogoutButton";
import { styles } from "../../user/styles/users.styles";

export default function LocationsScreen() {
  const router = useRouter();
  const { accessToken, logout, user } = useAuth();

  const [locations, setLocations] = useState<Location[]>([]);
  const [users, setUsers] = useState<UserWithLocation[]>([]);
  const [selectedLocation, setSelectedLocation] =
    useState<Location | null>(null);

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const itemsPerPage = 10;

  const getLocationName = (location: Location) =>
    location.road_name?.trim() ||
    `Location (${location.latitude}, ${location.longitude})`;

  const getAssignedCount = (location: Location) =>
    users.filter(
      (person) => person.location?.id === location.id
    ).length;

  const columns: DataTableColumn<Location>[] = [
    {
      key: "road_name",
      title: "Location",
      style: styles.nameColumn,
      render: (location) => getLocationName(location),
    },
    {
      key: "latitude",
      title: "Coordinates",
      style: styles.phoneColumn,
      render: (location) =>
        `${location.latitude}, ${location.longitude}`,
    },
    {
      key: "id",
      title: "Users",
      style: styles.roleColumn,
      render: (location) => getAssignedCount(location).toString(),
    },
  ];

  const loadLocations = useCallback(async () => {
    if (!accessToken) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError("");

      const [locationData, userData] = await Promise.all([
        getLocations(accessToken),
        getBattalionUsersWithLocations(accessToken),
      ]);

      // The users endpoint joins routes, so a user can appear
      // more than once. Count each user only once.
      const uniqueUsers = Array.from(
        new Map(
          userData.map((person) => [person.id, person])
        ).values()
      );

      setLocations(locationData);
      setUsers(uniqueUsers);

      setSelectedLocation((previous) =>
        previous
          ? locationData.find(
            (location) => location.id === previous.id
          ) ?? null
          : null
      );
    } catch (err) {
      if (err instanceof Error &&
        err.message.toLowerCase().includes("unauthorized")) {
        await logout();
        return;
      }

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load locations."
      );
    } finally {
      setIsLoading(false);
    }
  }, [accessToken, logout]);

  useFocusEffect(
    useCallback(() => {
      loadLocations();
    }, [loadLocations])
  );

  const filteredLocations = locations.filter((location) => {
    const searchText = search.toLowerCase();

    return (
      getLocationName(location).toLowerCase().includes(searchText) ||
      `${location.latitude}, ${location.longitude}`
        .toLowerCase()
        .includes(searchText)
    );
  });

  const totalPages = Math.ceil(
    filteredLocations.length / itemsPerPage
  );

  const startIndex = (currentPage - 1) * itemsPerPage;

  const paginatedLocations = filteredLocations.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const assignedUsers = selectedLocation
    ? users.filter(
      (person) =>
        person.location?.id === selectedLocation.id
    )
    : [];

  if (user?.role !== "admin") {
    return (
      <View style={styles.center}>
        <Text>You are not authorized to view this page.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Location Management</Text>
        <LogoutButton />
      </View>

      <View style={styles.content}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by location or coordinates"
          value={search}
          onChangeText={(text) => {
            setSearch(text);
            setCurrentPage(1);
          }}
        />

        {isLoading ? (
          <ActivityIndicator size="large" />
        ) : error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : (
          <>
            <DataTable
              data={paginatedLocations}
              rowKey={(location) => location.id}
              columns={columns}
              pressableRows
              onRowPress={setSelectedLocation}
            />

            {filteredLocations.length === 0 && (
              <Text style={styles.emptyText}>
                No locations found.
              </Text>
            )}

            {totalPages > 1 && (
              <View style={styles.pagination}>
                <Pressable
                  style={[
                    styles.pageButton,
                    currentPage === 1 && styles.disabledButton,
                  ]}
                  disabled={currentPage === 1}
                  onPress={() =>
                    setCurrentPage((page) => page - 1)
                  }
                >
                  <Text style={styles.pageButtonText}>
                    Previous
                  </Text>
                </Pressable>

                <Text style={styles.pageInfo}>
                  Page {currentPage} of {totalPages}
                </Text>

                <Pressable
                  style={[
                    styles.pageButton,
                    currentPage === totalPages &&
                    styles.disabledButton,
                  ]}
                  disabled={currentPage === totalPages}
                  onPress={() =>
                    setCurrentPage((page) => page + 1)
                  }
                >
                  <Text style={styles.pageButtonText}>
                    Next
                  </Text>
                </Pressable>
              </View>
            )}

            {selectedLocation && (
              <LocationDetails
                location={selectedLocation}
                assignedUsers={assignedUsers}
                onClose={() => setSelectedLocation(null)}
                onUserPress={(userId) =>
                  router.push({
                    pathname: "./user-detail/[id]",
                    params: { id: userId },
                  })
                }
              />
            )}
          </>
        )}
      </View>
    </ScrollView>
  );
}

const detailStyles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    gap: 10,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0F2A4A",
  },
  subtitle: {
    fontSize: 13,
    color: "#6B7280",
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0F2A4A",
  },
  value: {
    fontSize: 14,
    color: "#374151",
  },
  usersHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 12,
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#D1D5DB",
    gap: 12,
  },
  userName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
  },
  closeText: {
    color: "#0F2A4A",
    fontWeight: "600",
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
