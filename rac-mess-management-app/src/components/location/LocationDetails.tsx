import {
  View,
  Text,
  Pressable,
  StyleSheet,
} from "react-native";

import type { Location, UserWithLocation } from "@/api/location";

type LocationDetailsProps = {
  location: Location;
  assignedUsers: UserWithLocation[];
  onClose: () => void;
  onUserPress: (userId: string) => void;
};

export default function LocationDetails({
  location,
  assignedUsers,
  onClose,
  onUserPress,
}: LocationDetailsProps) {
  const locationName =
    location.road_name?.trim() ||
    `Location (${location.latitude}, ${location.longitude})`;

  return (
    <View style={styles.card}>
      <View style={styles.sectionHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{locationName}</Text>
          <Text style={styles.subtitle}>Location details</Text>
        </View>

        <Pressable onPress={onClose}>
          <Text style={styles.closeText}>Close</Text>
        </Pressable>
      </View>

      <Text style={styles.label}>Coordinates</Text>
      <Text style={styles.value}>
        Latitude: {location.latitude}
      </Text>
      <Text style={styles.value}>
        Longitude: {location.longitude}
      </Text>

      <View style={styles.usersHeader}>
        <Text style={styles.label}>Assigned Users</Text>
        <Text style={styles.subtitle}>
          {assignedUsers.length} users
        </Text>
      </View>

      {assignedUsers.length === 0 ? (
        <Text style={styles.subtitle}>
          No users are assigned to this location.
        </Text>
      ) : (
        assignedUsers.map((person) => (
          <Pressable
            key={person.id}
            style={styles.userRow}
            onPress={() => onUserPress(person.id)}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.userName}>{person.name}</Text>
              <Text style={styles.subtitle}>
                @{person.username}
              </Text>

              {person.phone && (
                <Text style={styles.subtitle}>
                  {person.phone}
                </Text>
              )}
            </View>

            <Text style={styles.closeText}>View Details</Text>
          </Pressable>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 20,
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#222222",
  },
  subtitle: {
    fontSize: 13,
    color: "#777777",
    marginTop: 4,
  },
  closeText: {
    color: "#2563EB",
    fontWeight: "600",
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 8,
  },
  value: {
    fontSize: 14,
    color: "#555555",
    marginBottom: 5,
  },
  usersHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 10,
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#EEEEEE",
  },
  userName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333333",
  },
});