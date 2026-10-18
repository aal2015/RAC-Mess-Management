
import { useState } from "react";
import {
    ActivityIndicator,
    Modal,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    View,
    StyleSheet,
} from "react-native";

import RouteMap from "@/components/RouteMap";
import { forwardGeocode } from "@/api/location";
import { ForwardGeocodeResult } from "@/api/location";
import { styles } from "../../user/styles/routes.styles";

export type MessLocationSearchResult = {
    display_name: string;
    latitude: number;
    longitude: number;
};

type AddMessLocationModalProps = {
    visible: boolean;
    loading: boolean;
    error: string | null;
    accessToken: string | null;
    onClose: () => void;
    onSubmit: (data: {
        name: string;
        latitude: number;
        longitude: number;
        landmark: string | null;
    }) => void;
};

export default function AddMessLocationModal({
    accessToken,
    visible,
    loading,
    error,
    onClose,
    onSubmit,
}: AddMessLocationModalProps) {
    const [name, setName] = useState("");
    const [landmark, setLandmark] = useState("");
    const [address, setAddress] = useState("");
    const [searchResult, setSearchResult] =
        useState<MessLocationSearchResult | null>(null);
    const [searchingAddress, setSearchingAddress] = useState(false);
    const [searchError, setSearchError] = useState("");

    const handleSearchAddress = async () => {
        if (!accessToken || !address.trim() || searchingAddress) {
            return;
        }

        try {
            setSearchingAddress(true);
            setSearchError("");

            const result: ForwardGeocodeResult = await forwardGeocode(
                accessToken,
                address.trim()
            );

            setSearchResult({
                display_name: result.display_name,
                latitude: Number(result.latitude),
                longitude: Number(result.longitude),
            });
        } catch (error) {
            console.error("Failed to search mess location:", error);

            setSearchResult(null);
            setSearchError(
                error instanceof Error
                    ? error.message
                    : "Failed to find address."
            );
        } finally {
            setSearchingAddress(false);
        }
    };

    const handleClose = () => {
        if (loading || searchingAddress) return;

        setName("");
        setLandmark("");
        setAddress("");
        setSearchResult(null);
        setSearchError("");
        onClose();
    };

    const handleSubmit = () => {
        if (!name.trim() || !searchResult || loading) return;

        onSubmit({
            name: name.trim(),
            latitude: searchResult.latitude,
            longitude: searchResult.longitude,
            landmark:
                landmark.trim() || searchResult.display_name,
        });
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={handleClose}
        >
            <View style={localStyles.overlay}>
                <View style={localStyles.modal}>
                    <ScrollView
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                    >
                        <Text style={styles.modalTitle}>
                            Add Mess Location
                        </Text>

                        <Text style={styles.modalSubtitle}>
                            Add the mess name and select its location on the map.
                        </Text>

                        {/* Mess name */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Mess Name *</Text>
                            <TextInput
                                style={styles.input}
                                value={name}
                                onChangeText={setName}
                                placeholder="Enter mess name"
                                editable={!loading}
                                maxLength={100}
                            />
                        </View>

                        {/* Landmark */}

                        {/* Location description */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>
                                Location Description (optional)
                            </Text>

                            <TextInput
                                style={styles.input}
                                value={landmark}
                                onChangeText={setLandmark}
                                placeholder="Describe where the mess is located"
                                editable={!loading}
                                maxLength={255}
                            />

                            <Text style={localStyles.helperText}>
                                If left blank, the searched address will be used as the description.
                            </Text>
                        </View>

                        {/* Address search */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>
                                Search Location *
                            </Text>

                            <TextInput
                                style={styles.input}
                                value={address}
                                onChangeText={(value) => {
                                    setAddress(value);
                                    setSearchResult(null);
                                    setSearchError("");
                                }}
                                placeholder="Enter an address or place"
                                editable={!loading && !searchingAddress}
                                onSubmitEditing={handleSearchAddress}
                                returnKeyType="search"
                            />

                            <Pressable
                                style={[
                                    styles.addRouteButton,
                                    localStyles.searchButton,
                                    (!address.trim() ||
                                        searchingAddress ||
                                        loading) &&
                                    localStyles.disabledButton,
                                ]}
                                onPress={handleSearchAddress}
                                disabled={
                                    !address.trim() || searchingAddress || loading
                                }
                            >
                                {searchingAddress ? (
                                    <ActivityIndicator color="#FFFFFF" />
                                ) : (
                                    <Text style={styles.addRouteButtonText}>
                                        Search Address
                                    </Text>
                                )}
                            </Pressable>

                            {!!searchError && (
                                <Text style={styles.errorText}>
                                    {searchError}
                                </Text>
                            )}
                        </View>

                        {/* Map preview */}
                        {searchResult && (
                            <View style={localStyles.previewSection}>
                                <Text style={styles.inputLabel}>
                                    Location Preview
                                </Text>

                                <View style={localStyles.map}>
                                    <RouteMap
                                        locations={[
                                            {
                                                id: "new-mess-location",
                                                name: name.trim() || "New Mess Location",
                                                username: "",
                                                latitude: searchResult.latitude,
                                                longitude: searchResult.longitude,
                                                road_name: searchResult.display_name,
                                            },
                                        ]}
                                    />
                                </View>

                                <Text style={localStyles.addressText}>
                                    {searchResult.display_name}
                                </Text>

                                <Text style={localStyles.coordinatesText}>
                                    Latitude: {searchResult.latitude}
                                    {"\n"}
                                    Longitude: {searchResult.longitude}
                                </Text>
                            </View>
                        )}

                        {!!error && (
                            <Text style={styles.errorText}>{error}</Text>
                        )}

                        {/* Actions */}
                        <View style={styles.modalActions}>
                            <Pressable
                                style={styles.cancelButton}
                                onPress={handleClose}
                                disabled={loading || searchingAddress}
                            >
                                <Text style={styles.cancelButtonText}>
                                    Cancel
                                </Text>
                            </Pressable>

                            <Pressable
                                style={[
                                    styles.createButton,
                                    (!name.trim() || !searchResult || loading) &&
                                    styles.disabledButton,
                                ]}
                                onPress={handleSubmit}
                                disabled={
                                    !name.trim() || !searchResult || loading
                                }
                            >
                                {loading ? (
                                    <ActivityIndicator color="#FFFFFF" />
                                ) : (
                                    <Text style={styles.createButtonText}>
                                        Save Mess Location
                                    </Text>
                                )}
                            </Pressable>
                        </View>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
}

const localStyles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center",
        alignItems: "center",
        padding: 12,
    },
    modal: {
        width: "100%",
        maxWidth: 700,
        maxHeight: "90%",
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        padding: 20,
    },
    searchButton: {
        marginTop: 10,
        alignSelf: "flex-start",
        paddingHorizontal: 18,
    },
    disabledButton: {
        opacity: 0.5,
    },
    previewSection: {
        marginTop: 12,
        marginBottom: 16,
    },
    map: {
        height: 260,
        marginTop: 8,
        borderRadius: 8,
        overflow: "hidden",
    },
    addressText: {
        marginTop: 10,
        color: "#374151",
        fontSize: 14,
    },
    coordinatesText: {
        marginTop: 6,
        color: "#6B7280",
        fontSize: 12,
    },

    helperText: {
        marginTop: 5,
        color: "#6B7280",
        fontSize: 12,
        lineHeight: 17,
    },
});
