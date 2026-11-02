
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";

import { useAuth } from "../../../auth/AuthContext";
import {
  forwardGeocode,
  createLocation,
  type ForwardGeocodeResult,
} from "../../../api/location";

import RouteMap, {
  type RouteMapLocation,
} from "@/components/RouteMap";

import LogoutButton from "../../../components/LogoutButton";
import { styles } from "../../../user/styles/users.styles";

import { StyleSheet } from "react-native";

export default function AddLocationScreen() {
  const router = useRouter();
  const { accessToken, user } = useAuth();

  const [address, setAddress] = useState("");
  const [searchResult, setSearchResult] =
    useState<ForwardGeocodeResult | null>(null);

  const [isSearching, setIsSearching] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSearchAddress = async () => {
    if (!accessToken || !address.trim()) {
      return;
    }

    try {
      setIsSearching(true);
      setError("");
      setSearchResult(null);

      const result = await forwardGeocode(
        accessToken,
        address.trim()
      );

      setSearchResult(result);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to search address."
      );
    } finally {
      setIsSearching(false);
    }
  };

  const handleCreateLocation = async () => {
    if (!accessToken || !searchResult) {
      return;
    }

    try {
      setIsSaving(true);
      setError("");

      await createLocation(accessToken, {
        latitude: Number(searchResult.latitude),
        longitude: Number(searchResult.longitude),
        road_name: searchResult.display_name,
      });

      router.back();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to create location."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const mapLocations: RouteMapLocation[] = searchResult
    ? [
        {
          id: "location-preview",
          name: searchResult.display_name,
          username: "",
          latitude: Number(searchResult.latitude),
          longitude: Number(searchResult.longitude),
          road_name: searchResult.display_name,
        },
      ]
    : [];

  if (user?.role !== "admin") {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>
          You are not authorized to access this page.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={pageStyles.scrollContent}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Add Location</Text>
        <LogoutButton />
      </View>

      <View style={[styles.content, pageStyles.content]}>
        <Text style={pageStyles.label}>
          Search Address
        </Text>

        <TextInput
          style={styles.searchInput}
          placeholder="Enter an address..."
          value={address}
          onChangeText={(text) => {
            setAddress(text);
            setSearchResult(null);
            setError("");
          }}
        />

        <Pressable
          style={[
            styles.addButton,
            pageStyles.actionButton,
            (!address.trim() || isSearching) &&
              styles.disabledButton,
          ]}
          onPress={handleSearchAddress}
          disabled={!address.trim() || isSearching}
        >
          {isSearching ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.addButtonText}>
              Search Address
            </Text>
          )}
        </Pressable>

        {error !== "" && (
          <Text style={styles.errorText}>{error}</Text>
        )}

        {searchResult && (
          <View style={pageStyles.resultSection}>
            <Text style={styles.title}>
              Location Found
            </Text>

            <Text style={pageStyles.address}>
              {searchResult.display_name}
            </Text>

            <View style={pageStyles.coordinates}>
              <Text>
                Latitude: {searchResult.latitude}
              </Text>
              <Text>
                Longitude: {searchResult.longitude}
              </Text>
            </View>

            <View style={pageStyles.mapContainer}>
              <RouteMap locations={mapLocations} />
            </View>

            <Pressable
              style={[
                styles.addButton,
                pageStyles.saveButton,
                isSaving && styles.disabledButton,
              ]}
              onPress={handleCreateLocation}
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.addButtonText}>
                  Save Location
                </Text>
              )}
            </Pressable>
          </View>
        )}

        <Pressable
          style={pageStyles.cancelButton}
          onPress={() => router.back()}
        >
          <Text style={pageStyles.cancelText}>
            Cancel
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const pageStyles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    width: "100%",
    maxWidth: 800,
    alignSelf: "center",
    gap: 16,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
  },
  actionButton: {
    marginTop: 0,
    alignItems: "center",
  },
  resultSection: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 20,
    gap: 14,
  },
  address: {
    fontSize: 14,
    color: "#555555",
  },
  coordinates: {
    gap: 6,
  },
  mapContainer: {
    height: 300,
    borderRadius: 10,
    overflow: "hidden",
  },
  saveButton: {
    marginTop: 4,
  },
  cancelButton: {
    alignItems: "center",
    padding: 12,
  },
  cancelText: {
    color: "#555555",
    fontWeight: "600",
  },
});
