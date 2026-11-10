import { useMemo, useState, useEffect } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
    ActivityIndicator,
    View,
    Text,
    Pressable,
    StyleSheet,
    ScrollView
} from "react-native";
import {
    getMyRouteBookings,
    getBookingDistances,
    type DeliveryUserResponse,
} from "@/api/routes";
import {
    getActiveTrackingSession,
    updateTrackingTarget,
    type TrackingSession,
} from "@/api/tracking";
import { useAuth } from "@/auth/AuthContext";
import { getCurrentBrowserLocation } from "@/utils/location";
import ActiveDeliveryMap from "@/components/ActiveDeliveryMap";
import {
    isDelivered, formatDistance, formatDuration,
    getDeliveredCount, getGroupDeliveryStatus, isGroupDelivered,
    groupBookingsByLocation, hasValidCoordinates, mapDistancesByLocationId,
    getFirstParam, getValidRestoredSession
} from "@/utils/deliveryUtils";

type MealType = "lunch" | "dinner";

type BookingWithDistance = DeliveryUserResponse & {
    distanceMeters: number | null;
    durationSeconds: number | null;
};

export type DeliveryGroup = {
    locationId: string;
    location: NonNullable<DeliveryUserResponse["location"]>;
    bookings: DeliveryUserResponse[];
};

export default function ActiveDelivery() {
    const [targetUpdating, setTargetUpdating] = useState(false);
    const [targetUpdateError, setTargetUpdateError] = useState<string | null>(null);

    const router = useRouter();

    const params = useLocalSearchParams<{
        sessionId?: string | string[];
        session?: string | string[];
        bookDate?: string | string[];
        meal?: string | string[];
        routeNumber?: string | string[];
        routeUserCount?: string | string[];
        userCount?: string | string[];
        lunchCount?: string | string[];
        dinnerCount?: string | string[];
    }>();

    // Normalize Expo Router parameters.
    const bookDate = getFirstParam(params.bookDate);
    const rawMeal = getFirstParam(params.meal);
    const sessionId = getFirstParam(params.sessionId);
    const rawSession = getFirstParam(params.session);
    const routeNumber = getFirstParam(params.routeNumber);
    const routeUserCount = getFirstParam(params.routeUserCount);
    const userCount = getFirstParam(params.userCount);
    const lunchCount = getFirstParam(params.lunchCount);
    const dinnerCount = getFirstParam(params.dinnerCount);

    const selectedMeal: MealType | null =
        rawMeal === "lunch" || rawMeal === "dinner"
            ? rawMeal
            : null;

    const restoredSession = getValidRestoredSession(
        rawSession,
        sessionId,
        bookDate,
        selectedMeal
    );
    const isRestoredSessionValid = restoredSession !== null;
    
    const [trackingSession, setTrackingSession] =
        useState<TrackingSession | null>(
            isRestoredSessionValid ? restoredSession : null
        );

    const [sessionLoading, setSessionLoading] = useState(
        !isRestoredSessionValid
    );

    const [sessionError, setSessionError] = useState<string | null>(
        isRestoredSessionValid
            ? null
            : restoredSession
                ? "The restored tracking session is invalid."
                : null
    );

    const [sessionValidated, setSessionValidated] =
        useState(isRestoredSessionValid);

    if (!sessionId) {
        return (
            <View style={{ padding: 20, gap: 12 }}>
                <Text style={{ fontSize: 20, fontWeight: "700" }}>
                    Tracking session unavailable
                </Text>

                <Text>
                    The tracking session ID is missing. Please return to
                    the Delivery screen and try again.
                </Text>

                <Pressable onPress={() => router.replace("/delivery")}>
                    <Text style={{ color: "#2563EB" }}>
                        ← Back to Delivery
                    </Text>
                </Pressable>
            </View>
        );
    }

    const handleSelectDestination = async (locationId: string) => {
        if (!accessToken || !trackingSession) {
            setTargetUpdateError("Tracking session is unavailable.");
            return;
        }

        setTargetUpdating(true);
        setTargetUpdateError(null);

        try {
            await updateTrackingTarget(
                accessToken,
                trackingSession.id,
                {
                    location_id: locationId,
                }
            );

            // Update the selected destination after backend success.
            setSelectedLocationId(locationId);

        } catch (error) {
            setTargetUpdateError(
                error instanceof Error
                    ? error.message
                    : "Failed to update delivery destination."
            );
        } finally {
            setTargetUpdating(false);
        }
    };

    const { accessToken } = useAuth();

    const [bookings, setBookings] = useState<DeliveryUserResponse[]>([]);
    const [driverLocation, setDriverLocation] = useState(() =>
        isRestoredSessionValid && restoredSession
            ? {
                latitude: restoredSession.current_latitude,
                longitude: restoredSession.current_longitude,
            }
            : null
    );

    const [usingLastKnownLocation, setUsingLastKnownLocation] =
        useState(isRestoredSessionValid);

    const [distancesByLocationId, setDistancesByLocationId] =
        useState<Record<string, {
            distanceMeters: number;
            durationSeconds: number;
        }>>({});

    const [selectedLocationId, setSelectedLocationId] =
        useState<string | null>(null);

    const [bookingsLoading, setBookingsLoading] = useState(false);
    const [locationLoading, setLocationLoading] = useState(true);
    const [distanceLoading, setDistanceLoading] = useState(false);

    const [bookingsError, setBookingsError] = useState<string | null>(null);
    const [locationError, setLocationError] = useState<string | null>(null);
    const [distanceError, setDistanceError] = useState<string | null>(null);

    const groupedBookings = useMemo(
        () => groupBookingsByLocation(bookings),
        [bookings]
    );

    useEffect(() => {
        let cancelled = false;

        async function restoreSession() {
            if (isRestoredSessionValid) {
                return;
            }

            if (!accessToken) {
                setSessionError("You are not authenticated.");
                setSessionLoading(false);
                return;
            }

            try {
                setSessionLoading(true);
                setSessionError(null);

                const response = await getActiveTrackingSession(accessToken);

                if (cancelled) return;

                if (
                    !response.has_active_session ||
                    !response.session
                ) {
                    throw new Error("No active delivery session was found.");
                }

                const session = response.session;

                if (
                    session.id !== sessionId ||
                    !session.is_active ||
                    session.book_date !== bookDate ||
                    session.meal_type !== selectedMeal
                ) {
                    throw new Error(
                        "The active tracking session does not match this delivery."
                    );
                }

                setTrackingSession(session);

                setDriverLocation({
                    latitude: session.current_latitude,
                    longitude: session.current_longitude,
                });

                setUsingLastKnownLocation(true);
                setSessionValidated(true);
            } catch (error) {
                if (!cancelled) {
                    setSessionError(
                        error instanceof Error
                            ? error.message
                            : "Failed to restore tracking session."
                    );
                }
            } finally {
                if (!cancelled) {
                    setSessionLoading(false);
                }
            }
        }

        restoreSession();

        return () => {
            cancelled = true;
        };
    }, [
        accessToken,
        sessionId,
        bookDate,
        selectedMeal,
        isRestoredSessionValid,
    ]);

    // 1. Get driver's browser location.
    useEffect(() => {
        if (!sessionValidated || !trackingSession) {
            return;
        }

        let cancelled = false;

        async function fetchDriverLocation() {
            try {
                setLocationLoading(true);
                setLocationError(null);

                const location = await getCurrentBrowserLocation();

                if (!cancelled) {
                    setDriverLocation(location);
                    setUsingLastKnownLocation(false);
                }
            } catch (error) {
                if (!cancelled) {
                    setLocationError(
                        error instanceof Error
                            ? error.message
                            : "Failed to get your location."
                    );
                }
            } finally {
                if (!cancelled) {
                    setLocationLoading(false);
                }
            }
        }

        fetchDriverLocation();

        return () => {
            cancelled = true;
        };
    }, [sessionValidated, trackingSession]);

    // 2. Fetch bookings for the date and meal passed in navigation.
    useEffect(() => {
        let cancelled = false;

        async function fetchBookings() {
            if (!accessToken) {
                setBookings([]);
                setBookingsLoading(false);
                return;
            }

            if (!bookDate || !selectedMeal) {
                setBookings([]);
                setBookingsError(
                    "The booking date or meal is missing. Go back and start delivery again.",
                );
                setBookingsLoading(false);
                return;
            }

            setBookingsLoading(true);
            setBookingsError(null);
            setDistanceError(null);
            setDistancesByLocationId({});
            setSelectedLocationId(null);

            try {
                const data = await getMyRouteBookings(
                    accessToken,
                    bookDate,
                    selectedMeal,
                );

                if (!cancelled) {
                    setBookings(data.bookings);
                }
            } catch (error) {
                if (!cancelled) {
                    setBookings([]);
                    setBookingsError(
                        error instanceof Error
                            ? error.message
                            : "Failed to fetch bookings.",
                    );
                }
            } finally {
                if (!cancelled) {
                    setBookingsLoading(false);
                }
            }
        }

        fetchBookings();

        return () => {
            cancelled = true;
        };
    }, [accessToken, bookDate, selectedMeal]);

    // 3. Calculate driving distances for unique locations.
    useEffect(() => {
        let cancelled = false;

        async function calculateDistances() {
            if (!driverLocation || groupedBookings.length === 0) {
                setDistancesByLocationId({});
                setDistanceLoading(false);
                return;
            }

            const validGroups = groupedBookings.filter((group) =>
                hasValidCoordinates(group.location)
            );

            if (validGroups.length === 0) {
                setDistancesByLocationId({});
                setDistanceError(
                    "No valid destination coordinates are available."
                );
                setDistanceLoading(false);
                return;
            }

            setDistanceLoading(true);
            setDistanceError(null);
            setDistancesByLocationId({});

            try {
                const distances = await getBookingDistances(
                    driverLocation,
                    validGroups.map((group) => ({
                        latitude: Number(group.location.latitude),
                        longitude: Number(group.location.longitude),
                    })),
                );

                if (cancelled) return;

                const result = mapDistancesByLocationId(validGroups, distances);
                setDistancesByLocationId(result);

            } catch (error) {
                if (!cancelled) {
                    setDistanceError(
                        error instanceof Error
                            ? error.message
                            : "Failed to calculate driving distances."
                    );
                }
            } finally {
                if (!cancelled) {
                    setDistanceLoading(false);
                }
            }
        }

        calculateDistances();

        return () => {
            cancelled = true;
        };
    }, [driverLocation, groupedBookings]);

    // 4. Delivery status for the selected meal.

    // 5. Sort pending deliveries nearest-first; completed deliveries last.
    const sortedGroups = useMemo(() => {
        if (!selectedMeal) return [];

        return groupedBookings
            .map((group) => {
                const distance = distancesByLocationId[group.locationId];

                return {
                    ...group,
                    distanceMeters: distance?.distanceMeters ?? null,
                    durationSeconds: distance?.durationSeconds ?? null,
                };
            })
            .sort((a, b) => {
                const aDelivered = isGroupDelivered(a, selectedMeal);
                const bDelivered = isGroupDelivered(b, selectedMeal);

                if (aDelivered !== bDelivered) {
                    return aDelivered ? 1 : -1;
                }

                return (
                    (a.distanceMeters ?? Infinity) -
                    (b.distanceMeters ?? Infinity)
                );
            });
    }, [groupedBookings, distancesByLocationId, selectedMeal]);

    const selectedGroup = sortedGroups.find(
        (group) => group.locationId === selectedLocationId
    );

    const activeGroup =
        selectedGroup ??
        (selectedMeal
            ? sortedGroups.find(
                (group) => !isGroupDelivered(group, selectedMeal)
            )
            : undefined) ??
        sortedGroups[0] ??
        null;

    const deliveredCount = selectedMeal
        ? getDeliveredCount(bookings, selectedMeal)
        : 0;

    const pendingCount = bookings.length - deliveredCount;

    // Local-only update for now.
    function markDelivered(bookingId: string) {
        if (!selectedMeal) return;

        setBookings((current) =>
            current.map((booking) =>
                booking.id === bookingId
                    ? {
                        ...booking,
                        ...(selectedMeal === "lunch"
                            ? { lunch_delivered: true }
                            : { dinner_delivered: true }),
                    }
                    : booking
            )
        );
    }

    if (!bookDate || !selectedMeal) {
        return (
            <View style={{ padding: 20, gap: 12 }}>
                <Text style={{ fontSize: 20, fontWeight: "700" }}>
                    Cannot start delivery
                </Text>
                <Text>
                    The booking date or meal was not passed correctly.
                    Please return to the Delivery screen and try again.
                </Text>
                <Pressable onPress={() => router.back()}>
                    <Text style={{ color: "#2563EB" }}>
                        ← Back to Delivery
                    </Text>
                </Pressable>
            </View>
        );
    }

    if (sessionLoading) {
        return (
            <View style={{ padding: 20, gap: 12 }}>
                <ActivityIndicator />
                <Text>Restoring delivery session...</Text>
            </View>
        );
    }

    if (sessionError || !sessionValidated) {
        return (
            <View style={{ padding: 20, gap: 12 }}>
                <Text style={{ fontSize: 20, fontWeight: "700" }}>
                    Unable to restore delivery
                </Text>

                <Text style={{ color: "#DC2626" }}>
                    {sessionError ?? "The tracking session is invalid."}
                </Text>

                <Pressable onPress={() => router.back()}>
                    <Text style={{ color: "#2563EB" }}>
                        ← Back to Delivery
                    </Text>
                </Pressable>
            </View>
        );
    }

    return (
        <ScrollView
            contentContainerStyle={{ padding: 16, gap: 12 }}
        >
            <Pressable onPress={() => router.back()}>
                <Text style={{ color: "#2563EB" }}>
                    ← Back to Delivery
                </Text>
            </Pressable>

            <Text style={{ fontSize: 24, fontWeight: "700" }}>
                Active Delivery · Route {routeNumber || "—"}
            </Text>

            <Text>
                {bookDate} · {selectedMeal === "lunch" ? "Lunch" : "Dinner"}
            </Text>

            <Text>
                Route users: {routeUserCount ?? "—"} · Total users: {userCount ?? "—"}
            </Text>

            {/* Map placeholder for future Directions API integration. */}
            {/* <View
                style={{
                    minHeight: 260,
                    borderRadius: 12,
                    backgroundColor: "#E5E7EB",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <Text>Map will go here</Text>
            </View> */}
            <ActiveDeliveryMap
                driverLocation={driverLocation}
                locations={groupedBookings.map((group) => ({
                    id: group.locationId,
                    name: group.location.road_name || "Unnamed location",
                    username: `${group.bookings.length} users`,
                    latitude: group.location.latitude,
                    longitude: group.location.longitude,
                    road_name: group.location.road_name,
                }))}
                selectedLocationId={activeGroup?.locationId ?? null}
            />

            {locationLoading ? (
                <View style={{ flexDirection: "row", gap: 8 }}>
                    <ActivityIndicator />
                    <Text>Getting your location…</Text>
                </View>
            ) : locationError ? (
                <Text style={{ color: "#DC2626" }}>
                    {locationError}
                </Text>
            ) : (
                <Text style={{ color: "#166534" }}>
                    Driver location acquired.
                </Text>
            )}

            <Text>
                Bookings: {bookings.length} · Pending: {pendingCount} ·
                Delivered: {deliveredCount}
            </Text>

            {bookingsLoading ? (
                <View style={{ flexDirection: "row", gap: 8 }}>
                    <ActivityIndicator />
                    <Text>Loading bookings…</Text>
                </View>
            ) : null}

            {bookingsError ? (
                <Text style={{ color: "#DC2626" }}>
                    {bookingsError}
                </Text>
            ) : null}

            {distanceLoading ? (
                <View style={{ flexDirection: "row", gap: 8 }}>
                    <ActivityIndicator />
                    <Text>Calculating driving distances…</Text>
                </View>
            ) : null}

            {distanceError ? (
                <Text style={{ color: "#B45309" }}>
                    Distances unavailable: {distanceError}
                </Text>
            ) : null}

            {activeGroup ? (
                <View
                    style={{
                        padding: 14,
                        borderRadius: 10,
                        borderWidth: 1,
                        borderColor: "#2563EB",
                        gap: 10,
                    }}
                >
                    <Text style={{ fontSize: 18, fontWeight: "700" }}>
                        Selected destination
                    </Text>

                    <Text style={{ fontWeight: "600" }}>
                        {activeGroup.location.road_name || "Unnamed location"}
                    </Text>

                    <Text>
                        {activeGroup.bookings.length} users
                    </Text>

                    <Text>
                        {formatDistance(activeGroup.distanceMeters)}
                        {activeGroup.durationSeconds != null
                            ? ` · ${formatDuration(activeGroup.durationSeconds)}`
                            : ""}
                    </Text>

                    {activeGroup.bookings.map((booking) => (
                        <View
                            key={booking.id}
                            style={{
                                flexDirection: "row",
                                justifyContent: "space-between",
                                alignItems: "center",
                                paddingVertical: 6,
                            }}
                        >
                            <Text>
                                {booking.name || booking.username}
                            </Text>

                            {isDelivered(booking, selectedMeal) ? (
                                <Text style={{ color: "#16A34A" }}>
                                    Delivered
                                </Text>
                            ) : (
                                <Pressable
                                    onPress={() => markDelivered(booking.id)}
                                    style={{
                                        backgroundColor: "#2563EB",
                                        paddingHorizontal: 12,
                                        paddingVertical: 8,
                                        borderRadius: 8,
                                    }}
                                >
                                    <Text style={{ color: "#FFFFFF" }}>
                                        Mark Delivered
                                    </Text>
                                </Pressable>
                            )}
                        </View>
                    ))}
                </View>
            ) : null}

            <Text style={{ fontSize: 18, fontWeight: "700" }}>
                Select a destination
            </Text>

            {targetUpdating ? (
                <View style={{ flexDirection: "row", gap: 8 }}>
                    <ActivityIndicator />
                    <Text>Updating delivery destination…</Text>
                </View>
            ) : null}

            {targetUpdateError ? (
                <Text style={{ color: "#DC2626" }}>
                    {targetUpdateError}
                </Text>
            ) : null}

            {sortedGroups.map((group, index) => {
                const delivered = selectedMeal
                    ? isGroupDelivered(group, selectedMeal)
                    : false;
                const selected = activeGroup?.locationId === group.locationId;

                const deliveredUsers = selectedMeal
                    ? getDeliveredCount(group.bookings, selectedMeal)
                    : 0;
                const totalUsers = group.bookings.length;

                const status = selectedMeal
                    ? getGroupDeliveryStatus(group, selectedMeal)
                    : "Pending";

                return (
                    <Pressable
                        key={group.locationId}
                        onPress={() => handleSelectDestination(group.locationId)}
                        disabled={targetUpdating}
                        style={{
                            padding: 12,
                            borderRadius: 10,
                            borderWidth: 1,
                            borderColor: selected ? "#2563EB" : "#E5E7EB",
                            backgroundColor: selected ? "#EFF6FF" : "#FFFFFF",
                            gap: 6,
                        }}
                    >
                        <View
                            style={{
                                flexDirection: "row",
                                justifyContent: "space-between",
                                gap: 8,
                            }}
                        >
                            <Text style={{ fontWeight: "700", flexShrink: 1 }}>
                                {index + 1}. {group.location.road_name || "Unnamed location"}
                            </Text>

                            <Text
                                style={{
                                    color: delivered ? "#16A34A" : "#166534",
                                    fontWeight: "600",
                                }}
                            >
                                {delivered
                                    ? "Completed"
                                    : deliveredUsers > 0
                                        ? "Partially delivered"
                                        : "Pending"}
                            </Text>
                        </View>

                        <Text>
                            {totalUsers} users · {deliveredUsers} delivered
                        </Text>

                        <Text>
                            {formatDistance(group.distanceMeters)}
                            {group.durationSeconds != null
                                ? ` · ${formatDuration(group.durationSeconds)}`
                                : ""}
                        </Text>

                        {selected ? (
                            <Text style={{ color: "#2563EB", fontWeight: "600" }}>
                                Selected
                            </Text>
                        ) : null}
                    </Pressable>
                );
            })}

            {!bookingsLoading &&
                !bookingsError &&
                bookings.length === 0 ? (
                <Text>No bookings found for this meal and date.</Text>
            ) : null}
        </ScrollView>
    );
}


const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: "#F8FAFC",
        paddingTop: 8,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 12,
    },
    backButton: {
        width: 42,
        height: 42,
        borderRadius: 12,
        backgroundColor: "#FFFFFF",
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: "#E2E8F0",
    },
    headerText: {
        flex: 1,
        gap: 4,
    },
    title: {
        fontSize: 20,
        fontWeight: "700",
        color: "#0F172A",
    },
    subtitle: {
        fontSize: 13,
        color: "#64748B",
    },
    mealBadge: {
        width: 42,
        height: 42,
        borderRadius: 12,
        backgroundColor: "#FEF3C7",
        alignItems: "center",
        justifyContent: "center",
    },
    dinnerBadge: {
        backgroundColor: "#EDE9FE",
    },
    bookingSection: {
        paddingHorizontal: 16,
        marginTop: 4,
    },
    sectionHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 10,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#0F172A",
    },
    remainingText: {
        fontSize: 12,
        color: "#64748B",
    },
    bookingList: {
        height: 210,
        flexShrink: 0,
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: "#E2E8F0",
        borderRadius: 14,
        overflow: "hidden",
    },
    listContent: {
        paddingHorizontal: 12,
    },
    bookingRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
        gap: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#F1F5F9",
    },
    numberCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: "#DBEAFE",
        alignItems: "center",
        justifyContent: "center",
    },
    deliveredCircle: {
        backgroundColor: "#16A34A",
    },
    numberText: {
        fontSize: 13,
        fontWeight: "700",
        color: "#1D4ED8",
    },
    bookingInfo: {
        flex: 1,
        gap: 3,
    },
    bookingName: {
        fontSize: 13,
        fontWeight: "600",
        color: "#0F172A",
    },
    landmark: {
        fontSize: 12,
        color: "#64748B",
    },
    distance: {
        fontSize: 11,
        color: "#64748B",
    },
    completedText: {
        color: "#64748B",
        textDecorationLine: "line-through",
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 5,
        borderRadius: 8,
    },
    statusDone: {
        backgroundColor: "#DCFCE7",
    },
    statusNext: {
        backgroundColor: "#DBEAFE",
    },
    statusPending: {
        backgroundColor: "#F1F5F9",
    },
    statusText: {
        fontSize: 10,
        fontWeight: "600",
        color: "#64748B",
    },
    statusDoneText: {
        color: "#15803D",
    },
    statusNextText: {
        color: "#1D4ED8",
    },
    emptyText: {
        padding: 20,
        textAlign: "center",
        color: "#64748B",
    },
    actionSection: {
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 12,
        gap: 10,
    },
    nextStop: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        backgroundColor: "#EFF6FF",
        borderRadius: 12,
        padding: 12,
    },
    nextStopInfo: {
        flex: 1,
        gap: 3,
    },
    nextStopLabel: {
        fontSize: 10,
        fontWeight: "700",
        letterSpacing: 0.7,
        color: "#1D4ED8",
    },
    nextStopName: {
        fontSize: 14,
        fontWeight: "600",
        color: "#0F172A",
    },
    deliveredButton: {
        minHeight: 46,
        borderRadius: 12,
        backgroundColor: "#2563EB",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
    },
    buttonPressed: {
        opacity: 0.8,
    },
    deliveredButtonText: {
        fontSize: 14,
        fontWeight: "700",
        color: "#FFFFFF",
    },
    completedBanner: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        padding: 14,
        backgroundColor: "#DCFCE7",
        borderRadius: 12,
    },
    completedBannerText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#15803D",
    },
    mapContainer: {
        flex: 1,
        minHeight: 150,
        marginHorizontal: 16,
        marginBottom: 12,
        backgroundColor: "#FFFFFF",
        borderRadius: 14,
        borderWidth: 1,
        borderColor: "#E2E8F0",
        overflow: "hidden",
    },
    mapHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#E2E8F0",
    },
    mapTitle: {
        fontSize: 14,
        fontWeight: "700",
        color: "#0F172A",
    },
    mapPlaceholder: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        backgroundColor: "#F1F5F9",
        gap: 8,
    },
    mapPlaceholderTitle: {
        fontSize: 15,
        fontWeight: "600",
        color: "#334155",
    },
    mapPlaceholderText: {
        fontSize: 12,
        lineHeight: 18,
        textAlign: "center",
        color: "#64748B",
    },
});
