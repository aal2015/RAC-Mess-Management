import { useAuth } from "@/auth/AuthContext";
import {
    View,
    Text,
    Pressable,
    ActivityIndicator,
} from "react-native";
import { useEffect, useState } from "react";

import type { User } from "@/api/admin";
import {
    getUserLocation,
    getLocations,
    assignUserLocation,
    type Location,
} from "@/api/location";

import { Dropdown } from "react-native-element-dropdown";

import RouteMap, {
    type RouteMapLocation,
} from "@/components/RouteMap";

import { styles } from "@/user/styles/user-detail.styles";

type UserLocationProps = {
    user: User;
    isAdmin: boolean;
};

export default function UserLocation({
    user,
    isAdmin,
}: UserLocationProps) {
    const { accessToken } = useAuth();

    const [location, setLocation] = useState<Location | null>(null);
    const [locations, setLocations] = useState<Location[]>([]);

    const [selectedLocationId, setSelectedLocationId] = useState("");

    const [locationLoading, setLocationLoading] = useState(true);
    const [locationsLoading, setLocationsLoading] = useState(true);

    const [locationError, setLocationError] = useState<string | null>(null);
    const [savingLocation, setSavingLocation] = useState(false);

    const selectedLocation = locations.find(
        (item) => item.id === selectedLocationId
    );

    // Load the user's currently assigned location.
    useEffect(() => {
        let isActive = true;

        async function loadLocation() {
            if (!accessToken) {
                setLocationLoading(false);
                return;
            }

            try {
                setLocationLoading(true);
                setLocationError(null);

                const data = await getUserLocation(
                    accessToken,
                    user.username
                );

                if (isActive) {
                    setLocation(data);
                    setSelectedLocationId(data?.id ?? "");
                }
            } catch (error) {
                console.error("Failed to load location:", error);

                if (isActive) {
                    setLocationError("Failed to load location.");
                }
            } finally {
                if (isActive) {
                    setLocationLoading(false);
                }
            }
        }

        loadLocation();

        return () => {
            isActive = false;
        };
    }, [accessToken, user.username]);

    // Load all locations belonging to the battalion.
    useEffect(() => {
        let isActive = true;

        async function loadLocations() {
            if (!accessToken) {
                setLocationsLoading(false);
                return;
            }

            try {
                const data = await getLocations(accessToken);

                if (isActive) {
                    setLocations(data);
                }
            } catch (error) {
                console.error("Failed to load locations:", error);

                if (isActive) {
                    setLocationError("Failed to load available locations.");
                }
            } finally {
                if (isActive) {
                    setLocationsLoading(false);
                }
            }
        }

        loadLocations();

        return () => {
            isActive = false;
        };
    }, [accessToken]);

    // Assign the selected location to the user.
    async function handleSaveLocation() {
        if (!accessToken || !selectedLocation) {
            return;
        }

        try {
            setSavingLocation(true);
            setLocationError(null);

            const updatedLocation = await assignUserLocation(
                accessToken,
                user.username,
                selectedLocation.id
            );

            setLocation({
                ...updatedLocation,
                road_name: updatedLocation.road_name ?? selectedLocation.road_name,
            });

            setSelectedLocationId(updatedLocation.id);
        } catch (error) {
            console.error("Failed to assign location:", error);

            setLocationError(
                error instanceof Error
                    ? error.message
                    : "Failed to assign location."
            );
        } finally {
            setSavingLocation(false);
        }
    }

    // Use the selected location for admins and assigned location for other users.
    const mapLocation = isAdmin ? selectedLocation : location;

    const mapLocations: RouteMapLocation[] = mapLocation
        ? [
            {
                id: mapLocation.id,
                name: mapLocation.road_name ?? "Selected Location",
                username: user.username,
                latitude: Number(mapLocation.latitude),
                longitude: Number(mapLocation.longitude),
                road_name: mapLocation.road_name,
            },
        ]
        : [];

    const isLoading = locationLoading || locationsLoading;

    return (
        <View style={styles.locationSection}>
            <Text style={styles.sectionTitle}>Location</Text>

            {isLoading ? (
                <View style={styles.locationLoading}>
                    <ActivityIndicator />
                    <Text style={styles.loadingText}>
                        Loading location...
                    </Text>
                </View>
            ) : (
                <>
                    {isAdmin ? (
                        <>
                            <View style={styles.locationCard}>
                                <Text style={styles.label}>Assigned Location</Text>
                                <Text style={styles.value}>
                                    {location
                                        ? location.road_name ?? "Unnamed Location"
                                        : "No location has been assigned to this user."}
                                </Text>
                            </View>

                            <Dropdown
                                style={styles.dropdown}
                                placeholderStyle={styles.placeholderStyle}
                                selectedTextStyle={styles.selectedTextStyle}
                                inputSearchStyle={styles.inputSearchStyle}
                                data={locations.map((item) => ({
                                    label: item.road_name ?? "Unnamed Location",
                                    value: item.id,
                                }))}
                                search
                                maxHeight={300}
                                labelField="label"
                                valueField="value"
                                placeholder="Select a location"
                                searchPlaceholder="Search locations..."
                                value={selectedLocationId}
                                onChange={(item) => {
                                    setSelectedLocationId(item.value);
                                    setLocationError(null);
                                }}
                            />

                            {selectedLocation && (
                                <>
                                    <RouteMap locations={mapLocations} />

                                    <Pressable
                                        style={styles.locationButton}
                                        onPress={handleSaveLocation}
                                        disabled={
                                            savingLocation ||
                                            selectedLocation.id === location?.id
                                        }
                                    >
                                        {savingLocation ? (
                                            <ActivityIndicator color="#fff" />
                                        ) : (
                                            <Text style={styles.locationButtonText}>
                                                {location
                                                    ? "Update Location"
                                                    : "Save Location"}
                                            </Text>
                                        )}
                                    </Pressable>
                                </>
                            )}
                        </>
                    ) : (
                        <>
                            {location ? (
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

                                    <RouteMap locations={mapLocations} />
                                </>
                            ) : (
                                <Text style={styles.noLocationText}>
                                    No location has been assigned to this user.
                                </Text>
                            )}
                        </>
                    )}

                    {locationError && (
                        <Text style={styles.errorText}>
                            {locationError}
                        </Text>
                    )}
                </>
            )}
        </View>
    );
}
