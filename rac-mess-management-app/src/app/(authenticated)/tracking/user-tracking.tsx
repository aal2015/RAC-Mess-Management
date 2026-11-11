
import { useCallback, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
    ScrollView,
} from "react-native";
import { useFocusEffect } from "expo-router";

import { useAuth } from "@/auth/AuthContext";
import LogoutButton from "@/components/LogoutButton";

import {
    getActiveTrackingSession,
    getUserLocation,
    type TrackingSession,
    type UserLocation,
} from "@/api/tracking";

import ActiveDeliveryMap from "@/components/ActiveDeliveryMap";

type DriverLocation = {
    latitude: number;
    longitude: number;
};

export default function UserTrackingScreen() {
    const { user, accessToken } = useAuth();

    const [userLocation, setUserLocation] =
        useState<UserLocation | null>(null);

    const [session, setSession] =
        useState<TrackingSession | null>(null);

    const [driverLocation, setDriverLocation] =
        useState<DriverLocation | null>(null);

    const [loading, setLoading] = useState(true);
    const [locationLoading, setLocationLoading] = useState(true);

    const [error, setError] = useState<string | null>(null);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

    // Fetch user's assigned location when page opens.
    useFocusEffect(
        useCallback(() => {
            const token = accessToken;
            const username = user?.username;

            if (!token || !username) {
                setLocationLoading(false);
                return;
            }

            let cancelled = false;

            async function fetchUserLocation() {
                try {
                    setLocationLoading(true);

                    const location = await getUserLocation(
                        token,
                        username
                    );

                    if (!cancelled) {
                        setUserLocation(location);
                    }
                } catch (err) {
                    console.error("User location error:", err);

                    if (!cancelled) {
                        setUserLocation(null);
                    }
                } finally {
                    if (!cancelled) {
                        setLocationLoading(false);
                    }
                }
            }

            fetchUserLocation();

            return () => {
                cancelled = true;
            };
        }, [accessToken, user?.username])
    );

    // Fetch and poll active tracking session.
    useFocusEffect(
        useCallback(() => {
            const token = accessToken;

            if (!token) {
                setLoading(false);
                return;
            }

            let cancelled = false;
            let inFlight = false;

            async function fetchTrackingSession() {
                if (inFlight) return;

                inFlight = true;

                try {
                    const response = await getActiveTrackingSession(token);

                    if (cancelled) return;

                    if (!response.has_active_session || !response.session) {
                        setSession(null);
                        setDriverLocation(null);
                        setLastUpdated(new Date());
                        setError(null);
                        return;
                    }

                    const activeSession = response.session;

                    setSession(activeSession);

                    // Update driver coordinates.
                    if (
                        activeSession.current_latitude != null &&
                        activeSession.current_longitude != null
                    ) {
                        setDriverLocation({
                            latitude: activeSession.current_latitude,
                            longitude: activeSession.current_longitude,
                        });
                    }

                    setLastUpdated(new Date());
                    setError(null);

                } catch (err) {
                    console.error("Tracking update error:", err);

                    if (!cancelled) {
                        setError("Unable to refresh bus location.");
                    }
                } finally {
                    inFlight = false;

                    if (!cancelled) {
                        setLoading(false);
                    }
                }
            }

            fetchTrackingSession();

            const interval = setInterval(
                fetchTrackingSession,
                15000
            );

            return () => {
                cancelled = true;
                clearInterval(interval);
            };
        }, [accessToken])
    );

    // Determine whether the driver is coming to this user.
    const isComingToMe =
        !!session &&
        !!userLocation &&
        session.target_location_id === userLocation.id;

    const hasTarget = !!session?.target_location_id;

    const statusTitle = !session
        ? "Bus is not active"
        : isComingToMe
            ? "Bus is coming to you!"
            : hasTarget
                ? "Bus is heading to another stop"
                : "Waiting for destination";

    const statusDescription = !session
        ? "The driver has not started a delivery session yet."
        : isComingToMe
            ? "The driver has selected your delivery location."
            : hasTarget
                ? "The driver is currently delivering to another location."
                : "The driver has not selected a destination yet.";

    const statusColor = !session
        ? "#9CA3AF"
        : isComingToMe
            ? "#16A34A"
            : hasTarget
                ? "#2563EB"
                : "#D97706";

    const formattedTime = lastUpdated
        ? lastUpdated.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
        })
        : "Not updated yet";

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.content}
        >
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerText}>
                    <Text style={styles.greeting}>
                        Tracking Delivery
                    </Text>

                    <Text style={styles.userInfo}>
                        {user?.username} • {user?.battalion ?? "-"}
                    </Text>
                </View>

                <LogoutButton />
            </View>

            {/* Status Card */}
            <View style={styles.statusCard}>
                <View style={styles.statusHeader}>
                    <View style={styles.statusTextContainer}>
                        <Text style={styles.statusTitle}>
                            {statusTitle}
                        </Text>

                        <Text style={styles.statusDescription}>
                            {statusDescription}
                        </Text>
                    </View>

                    <View
                        style={[
                            styles.statusDot,
                            { backgroundColor: statusColor },
                        ]}
                    />
                </View>

                <View style={styles.updateRow}>
                    {loading ? (
                        <ActivityIndicator
                            size="small"
                            color="#2563EB"
                        />
                    ) : null}

                    <Text style={styles.updateText}>
                        {session ? "Tracking active" : "Not tracking"}
                    </Text>

                    <View style={{ flex: 1 }} />

                    <Text style={styles.updateText}>
                        Updated: {formattedTime}
                    </Text>
                </View>
            </View>

            {/* Map */}
            <View style={styles.mapContainer}>
                {userLocation ? (
                    <ActiveDeliveryMap
                        driverLocation={driverLocation}
                        locations={[
                            {
                                id: userLocation.id,
                                name: userLocation.road_name || "Your location",
                                username: "Your delivery location",
                                latitude: userLocation.latitude,
                                longitude: userLocation.longitude,
                                road_name: userLocation.road_name,
                            },
                        ]}
                        selectedLocationId={
                            session?.target_location_id ?? null
                        }
                    />
                ) : locationLoading ? (
                    <View style={styles.mapPlaceholder}>
                        <ActivityIndicator
                            size="large"
                            color="#2563EB"
                        />
                        <Text style={styles.placeholderText}>
                            Loading your location...
                        </Text>
                    </View>
                ) : (
                    <View style={styles.mapPlaceholder}>
                        <Text style={styles.errorText}>
                            Unable to load your delivery location.
                        </Text>
                    </View>
                )}
            </View>

            {/* Delivery Information */}
            <View style={styles.infoCard}>
                <Text style={styles.sectionTitle}>
                    Delivery Information
                </Text>

                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>
                        Your location
                    </Text>

                    <Text style={styles.infoValue}>
                        {userLocation?.road_name || "Unavailable"}
                    </Text>
                </View>

                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>
                        Bus destination
                    </Text>

                    <Text style={styles.infoValue}>
                        {!session
                            ? "Not available"
                            : isComingToMe
                                ? "Your location"
                                : hasTarget
                                    ? "Another location"
                                    : "Not selected"}
                    </Text>
                </View>

                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>
                        Driver location
                    </Text>

                    <Text style={styles.infoValue}>
                        {driverLocation
                            ? "Available"
                            : "Waiting for location"}
                    </Text>
                </View>
            </View>

            {/* Errors */}
            {error && (
                <Text style={styles.errorText}>
                    {error} Showing the last available location.
                </Text>
            )}

            {locationLoading && (
                <Text style={styles.updateText}>
                    Loading your assigned location...
                </Text>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F9FAFB",
    },
    content: {
        padding: 16,
        paddingBottom: 32,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
    },
    headerText: {
        flex: 1,
    },
    greeting: {
        fontSize: 22,
        fontWeight: "700",
        color: "#111827",
    },
    userInfo: {
        fontSize: 13,
        color: "#6B7280",
        marginTop: 4,
    },
    statusCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        elevation: 2,
    },
    statusHeader: {
        flexDirection: "row",
        alignItems: "center",
    },
    statusTextContainer: {
        flex: 1,
    },
    statusTitle: {
        fontSize: 19,
        fontWeight: "700",
        color: "#111827",
    },
    statusDescription: {
        fontSize: 14,
        color: "#6B7280",
        marginTop: 6,
    },
    statusDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginLeft: 12,
    },
    updateRow: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 16,
        gap: 8,
    },
    updateText: {
        fontSize: 12,
        color: "#6B7280",
    },
    mapContainer: {
        height: 350,
        borderRadius: 12,
        overflow: "hidden",
        marginBottom: 16,
        backgroundColor: "#E5E7EB",
    },
    mapPlaceholder: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        gap: 10,
        padding: 16,
    },
    placeholderText: {
        fontSize: 13,
        color: "#6B7280",
    },
    infoCard: {
        backgroundColor: "#FFFFFF",
        padding: 16,
        borderRadius: 12,
        elevation: 2,
    },
    sectionTitle: {
        fontSize: 17,
        fontWeight: "700",
        color: "#111827",
        marginBottom: 16,
    },
    infoRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 14,
        gap: 12,
    },
    infoLabel: {
        fontSize: 13,
        color: "#6B7280",
    },
    infoValue: {
        fontSize: 13,
        fontWeight: "600",
        color: "#111827",
        flexShrink: 1,
        textAlign: "right",
    },
    errorText: {
        color: "#DC2626",
        fontSize: 13,
        marginTop: 12,
    },
});
