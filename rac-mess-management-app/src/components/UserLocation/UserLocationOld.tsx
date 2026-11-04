import { useAuth } from "@/auth/AuthContext";
import {
    View,
    Text,
    TextInput,
    Pressable,
    ActivityIndicator,
} from "react-native";
import { useEffect, useState } from "react";

import type { User } from "@/api/admin";
import {
    getUserLocation,
    getLocations,
    forwardGeocode,
    createUserLocation,
    updateUserLocation,
    assignUserLocation,
    type Location,
    type ForwardGeocodeResult,
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
    const [locationLoading, setLocationLoading] = useState(true);
    const [locationError, setLocationError] = useState<string | null>(null);

    const [isEditingLocation, setIsEditingLocation] = useState(false);
    const [address, setAddress] = useState("");

    const [searchingAddress, setSearchingAddress] = useState(false);
    const [savingLocation, setSavingLocation] = useState(false);

    const [locations, setLocations] = useState<Location[]>([]);
    const [selectedLocationId, setSelectedLocationId] = useState("");

    const [searchResult, setSearchResult] =
        useState<ForwardGeocodeResult | null>(null);

    const selectedLocation = locations.find(
        (item) => item.id === selectedLocationId
    );

    const selectedMapLocations: RouteMapLocation[] = selectedLocation
        ? [
            {
                id: selectedLocation.id,
                name: selectedLocation.road_name ?? "Selected Location",
                username: user.username,
                latitude: selectedLocation.latitude,
                longitude: selectedLocation.longitude,
                road_name: selectedLocation.road_name,
            },
        ]
        : [];

    // Load the user's assigned location.
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

    useEffect(() => {
        let isActive = true;

        async function loadLocations() {
            if (!accessToken) return;

            try {
                const data = await getLocations(accessToken);

                if (isActive) {
                    setLocations(data);
                }
            } catch (error) {
                console.error("Failed to load locations:", error);
            }
        }

        loadLocations();

        return () => {
            isActive = false;
        };
    }, [accessToken]);

    async function handleSearchAddress() {
        if (!accessToken || !address.trim()) {
            return;
        }

        try {
            setSearchingAddress(true);
            setLocationError(null);

            const result = await forwardGeocode(
                accessToken,
                address.trim()
            );

            setSearchResult(result);
        } catch (error) {
            console.error("Failed to search address:", error);

            setSearchResult(null);
            setLocationError(
                error instanceof Error
                    ? error.message
                    : "Failed to find address."
            );
        } finally {
            setSearchingAddress(false);
        }
    }

    async function handleCreateLocation() {
        if (!accessToken || !searchResult) {
            return;
        }

        try {
            setSavingLocation(true);
            setLocationError(null);

            const createdLocation = await createUserLocation(
                accessToken,
                user.username,
                searchResult.latitude,
                searchResult.longitude,
                searchResult.display_name
            );

            setLocation(createdLocation);
            setIsEditingLocation(false);
            setSearchResult(null);
            setAddress("");
        } catch (error) {
            console.error("Failed to create location:", error);

            setLocationError(
                error instanceof Error
                    ? error.message
                    : "Failed to save location."
            );
        } finally {
            setSavingLocation(false);
        }
    }

    async function handleUpdateLocation() {
        if (!accessToken || !searchResult) {
            return;
        }

        try {
            setSavingLocation(true);
            setLocationError(null);

            const updatedLocation = await updateUserLocation(
                accessToken,
                user.username,
                searchResult.latitude,
                searchResult.longitude,
                searchResult.display_name
            );

            setLocation(updatedLocation);
            setIsEditingLocation(false);
            setSearchResult(null);
            setAddress("");
        } catch (error) {
            console.error("Failed to update location:", error);

            setLocationError(
                error instanceof Error
                    ? error.message
                    : "Failed to update location."
            );
        } finally {
            setSavingLocation(false);
        }
    }

    function handleCancelEdit() {
        setIsEditingLocation(false);
        setSearchResult(null);
        setAddress("");
        setLocationError(null);
    }

    function handleStartEditing() {
        setAddress(location?.road_name ?? "");
        setSearchResult(null);
        setLocationError(null);
        setIsEditingLocation(true);
    }

    const mapLocations: RouteMapLocation[] = location
        ? [
            {
                id: user.id,
                name: user.name,
                username: user.username,
                latitude: Number(location.latitude),
                longitude: Number(location.longitude),
                road_name: location.road_name,
            },
        ]
        : [];

    const previewLocations: RouteMapLocation[] = searchResult
        ? [
            {
                id: user.id,
                name: user.name,
                username: user.username,
                latitude: Number(searchResult.latitude),
                longitude: Number(searchResult.longitude),
                road_name: searchResult.display_name,
            },
        ]
        : [];

    return (
        <View style={styles.locationSection}>
            <Text style={styles.sectionTitle}>Location</Text>

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
                }}
            />

            {selectedLocation && (
                <RouteMap locations={selectedMapLocations} />
            )}

            {locationLoading ? (
                <View style={styles.locationLoading}>
                    <ActivityIndicator />
                    <Text style={styles.loadingText}>
                        Loading location...
                    </Text>
                </View>
            ) : locationError && !location && !isEditingLocation ? (
                <Text style={styles.errorText}>{locationError}</Text>
            ) : location && !isEditingLocation ? (
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

                    {isAdmin && (
                        <Pressable
                            style={styles.locationButton}
                            onPress={handleStartEditing}
                        >
                            <Text style={styles.locationButtonText}>
                                Edit Location
                            </Text>
                        </Pressable>
                    )}
                </>
            ) : (
                <>
                    {!location && (
                        <Text style={styles.noLocationText}>
                            No location has been assigned to this user.
                        </Text>
                    )}

                    {isAdmin && (
                        <View style={styles.locationForm}>
                            <Text style={styles.label}>Search Address</Text>

                            <TextInput
                                style={styles.addressInput}
                                value={address}
                                onChangeText={(value) => {
                                    setAddress(value);
                                    setSearchResult(null);
                                    setLocationError(null);
                                }}
                                placeholder="Enter an address..."
                            />

                            <Pressable
                                style={styles.searchButton}
                                onPress={handleSearchAddress}
                                disabled={searchingAddress || !address.trim()}
                            >
                                {searchingAddress ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text style={styles.searchButtonText}>
                                        Search
                                    </Text>
                                )}
                            </Pressable>

                            {locationError && (
                                <Text style={styles.errorText}>
                                    {locationError}
                                </Text>
                            )}

                            {searchResult && (
                                <View style={styles.searchResult}>
                                    <Text style={styles.label}>
                                        Location Found
                                    </Text>

                                    <Text style={styles.value}>
                                        {searchResult.display_name}
                                    </Text>

                                    <Text style={styles.coordinates}>
                                        {searchResult.latitude},{" "}
                                        {searchResult.longitude}
                                    </Text>

                                    <RouteMap locations={previewLocations} />
                                </View>
                            )}

                            {searchResult && (
                                <Pressable
                                    style={styles.locationButton}
                                    onPress={
                                        location
                                            ? handleUpdateLocation
                                            : handleCreateLocation
                                    }
                                    disabled={savingLocation}
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
                            )}

                            {location && (
                                <Pressable
                                    style={styles.cancelButton}
                                    onPress={handleCancelEdit}
                                >
                                    <Text style={styles.cancelButtonText}>
                                        Cancel
                                    </Text>
                                </Pressable>
                            )}
                        </View>
                    )}
                </>
            )}
        </View>
    );
}
