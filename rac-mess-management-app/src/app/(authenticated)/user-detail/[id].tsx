import {
  View,
  Text,
  TextInput,
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
import {
  getUserLocation,
  type Location,
} from "../../../api/location";

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

  const [location, setLocation] = useState<Location | null>(null);
  const [locationLoading, setLocationLoading] = useState(true);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isEditingLocation, setIsEditingLocation] = useState(false);
  const [address, setAddress] = useState("");


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

  useEffect(() => {
    async function loadLocation() {
      if (!accessToken || !user?.username) {
        return;
      }

      try {
        setLocationLoading(true);
        setLocationError(null);

        const data = await getUserLocation(
          accessToken,
          user.username
        );

        setLocation(data);
      } catch (error) {
        console.error("Failed to load location:", error);
        setLocationError("Failed to load location.");
      } finally {
        setLocationLoading(false);
      }
    }

    loadLocation();
  }, [accessToken, user?.username]);

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

          <View style={styles.locationSection}>
            <Text style={styles.sectionTitle}>Location</Text>

            {locationLoading ? (
              <View style={styles.locationLoading}>
                <ActivityIndicator />
                <Text style={styles.loadingText}>
                  Loading location...
                </Text>
              </View>
            ) : locationError ? (
              <Text style={styles.errorText}>
                {locationError}
              </Text>
            ) : location ? (
              <>
                <View style={styles.locationCard}>
                  <Text style={styles.label}>Address</Text>
                  <Text style={styles.value}>
                    {location.road_name ?? "-"}
                  </Text>

                  <Text style={styles.label}>Latitude</Text>
                  <Text style={styles.value}>
                    {location.latitude}
                  </Text>

                  <Text style={styles.label}>Longitude</Text>
                  <Text style={styles.value}>
                    {location.longitude}
                  </Text>
                </View>

                <View style={styles.mapPlaceholder}>
                  <Text style={styles.mapPlaceholderText}>
                    Map coming soon
                  </Text>
                </View>

                <Pressable
                  style={styles.locationButton}
                  onPress={() => {
                    setAddress(location.road_name ?? "");
                    setIsEditingLocation(true);
                  }}
                >
                  <Text style={styles.locationButtonText}>
                    Edit Location
                  </Text>
                </Pressable>
              </>
            ) : (
              <>
                <Text style={styles.noLocationText}>
                  No location has been assigned to this user.
                </Text>

                <Pressable
                  style={styles.locationButton}
                  onPress={() => {
                    setAddress("");
                    setIsEditingLocation(true);
                  }}
                >
                  <Text style={styles.locationButtonText}>
                    Add Location
                  </Text>
                </Pressable>
              </>
            )}

            {isEditingLocation && (
              <View style={styles.locationForm}>
                <Text style={styles.label}>Search Address</Text>

                <TextInput
                  style={styles.addressInput}
                  value={address}
                  onChangeText={setAddress}
                  placeholder="Enter an address..."
                />

                <Pressable
                  style={styles.searchButton}
                  onPress={() => {
                    // LocationIQ search will be added here
                  }}
                >
                  <Text style={styles.searchButtonText}>
                    Search
                  </Text>
                </Pressable>

                <View style={styles.mapPlaceholder}>
                  <Text style={styles.mapPlaceholderText}>
                    Map coming soon
                  </Text>
                </View>
              </View>
            )}
          </View>
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