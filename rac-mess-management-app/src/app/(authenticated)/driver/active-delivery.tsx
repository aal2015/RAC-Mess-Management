
import { useMemo, useState, useEffect } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
    ActivityIndicator,
    View,
    Text,
    FlatList,
    Pressable,
    StyleSheet,
    ScrollView
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
    getMyRouteBookings,
    getBookingDistances,
    type DeliveryUserResponse,
} from "@/api/routes";
import { useAuth } from "@/auth/AuthContext";
import { getCurrentBrowserLocation } from "@/utils/location";
import ActiveDeliveryMap from "@/components/ActiveDeliveryMap";

type MealType = "lunch" | "dinner";

type BookingWithDistance = DeliveryUserResponse & {
    distanceMeters: number | null;
    durationSeconds: number | null;
};

export default function ActiveDelivery() {
    const router = useRouter();

    const params = useLocalSearchParams<{
        bookDate?: string | string[];
        meal?: string | string[];
        routeNumber?: string | string[];
        routeUserCount?: string | string[];
        userCount?: string | string[];
        lunchCount?: string | string[];
        dinnerCount?: string | string[];
    }>();

    // Normalize Expo Router parameters.
    const bookDate = Array.isArray(params.bookDate)
        ? params.bookDate[0]
        : params.bookDate;

    const rawMeal = Array.isArray(params.meal)
        ? params.meal[0]
        : params.meal;

    const selectedMeal: MealType | null =
        rawMeal === "lunch" || rawMeal === "dinner"
            ? rawMeal
            : null;

    const routeNumber = Array.isArray(params.routeNumber)
        ? params.routeNumber[0]
        : params.routeNumber;

    const routeUserCount = Array.isArray(params.routeUserCount)
        ? params.routeUserCount[0]
        : params.routeUserCount;

    const userCount = Array.isArray(params.userCount)
        ? params.userCount[0]
        : params.userCount;

    const lunchCount = Array.isArray(params.lunchCount)
        ? params.lunchCount[0]
        : params.lunchCount;

    const dinnerCount = Array.isArray(params.dinnerCount)
        ? params.dinnerCount[0]
        : params.dinnerCount;

    const { accessToken } = useAuth();

    const [bookings, setBookings] =
        useState<DeliveryUserResponse[]>([]);

    const [driverLocation, setDriverLocation] = useState<{
        latitude: number;
        longitude: number;
    } | null>(null);

    const [distancesByBookingId, setDistancesByBookingId] =
        useState<Record<string, {
            distanceMeters: number;
            durationSeconds: number;
        }>>({});

    const [selectedBookingId, setSelectedBookingId] =
        useState<string | null>(null);

    const [bookingsLoading, setBookingsLoading] = useState(false);
    const [locationLoading, setLocationLoading] = useState(true);
    const [distanceLoading, setDistanceLoading] = useState(false);

    const [bookingsError, setBookingsError] =
        useState<string | null>(null);

    const [locationError, setLocationError] =
        useState<string | null>(null);

    const [distanceError, setDistanceError] =
        useState<string | null>(null);

    // 1. Get driver's browser location.
    useEffect(() => {
        let cancelled = false;

        async function fetchDriverLocation() {
            try {
                setLocationLoading(true);
                setLocationError(null);

                const location = await getCurrentBrowserLocation();

                if (!cancelled) {
                    setDriverLocation(location);
                }
            } catch (error) {
                if (!cancelled) {
                    setLocationError(
                        error instanceof Error
                            ? error.message
                            : "Failed to get your location.",
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
    }, []);

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
            setDistancesByBookingId({});
            setSelectedBookingId(null);

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

    // 3. Calculate driving distances using LocationIQ Matrix.
    useEffect(() => {
        let cancelled = false;

        async function calculateDistances() {
            if (!driverLocation || bookings.length === 0) {
                setDistancesByBookingId({});
                setDistanceLoading(false);
                return;
            }

            const validBookings = bookings.filter((booking) => {
                const latitude = Number(booking.location?.latitude);
                const longitude = Number(booking.location?.longitude);

                return (
                    booking.location != null &&
                    Number.isFinite(latitude) &&
                    Number.isFinite(longitude) &&
                    latitude >= -90 &&
                    latitude <= 90 &&
                    longitude >= -180 &&
                    longitude <= 180
                );
            });

            if (validBookings.length === 0) {
                setDistancesByBookingId({});
                setDistanceError(
                    "No valid destination coordinates are available.",
                );
                return;
            }

            setDistanceLoading(true);
            setDistanceError(null);
            setDistancesByBookingId({});

            try {
                const distances = await getBookingDistances(
                    driverLocation,
                    validBookings.map((booking) => ({
                        latitude: Number(booking.location.latitude),
                        longitude: Number(booking.location.longitude),
                    })),
                );

                if (cancelled) return;

                const result: Record<string, {
                    distanceMeters: number;
                    durationSeconds: number;
                }> = {};

                validBookings.forEach((booking, index) => {
                    result[booking.id] = distances[index];
                });

                setDistancesByBookingId(result);
            } catch (error) {
                if (!cancelled) {
                    setDistanceError(
                        error instanceof Error
                            ? error.message
                            : "Failed to calculate driving distances.",
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
    }, [driverLocation, bookings]);

    // 4. Delivery status for the selected meal.
    function isDelivered(booking: DeliveryUserResponse) {
        if (!selectedMeal) return false;

        return selectedMeal === "lunch"
            ? booking.lunch_delivered
            : booking.dinner_delivered;
    }

    // 5. Sort pending deliveries nearest-first; completed deliveries last.
    const sortedBookings = useMemo<BookingWithDistance[]>(() => {
        return bookings
            .map((booking) => {
                const distance = distancesByBookingId[booking.id];

                return {
                    ...booking,
                    distanceMeters: distance?.distanceMeters ?? null,
                    durationSeconds: distance?.durationSeconds ?? null,
                };
            })
            .sort((a, b) => {
                const aDelivered = isDelivered(a);
                const bDelivered = isDelivered(b);

                if (aDelivered !== bDelivered) {
                    return aDelivered ? 1 : -1;
                }

                const aDistance = a.distanceMeters ?? Infinity;
                const bDistance = b.distanceMeters ?? Infinity;

                return aDistance - bDistance;
            });
    }, [bookings, distancesByBookingId, selectedMeal]);

    const deliveredCount = bookings.filter(isDelivered).length;
    const pendingCount = bookings.length - deliveredCount;

    const selectedBooking = sortedBookings.find(
        (booking) => booking.id === selectedBookingId,
    );

    const activeBooking =
        selectedBooking ??
        sortedBookings.find((booking) => !isDelivered(booking)) ??
        sortedBookings[0] ??
        null;

    const nextBooking = activeBooking;

    // Local-only update for now.
    function markDelivered() {
        if (!activeBooking || isDelivered(activeBooking) || !selectedMeal) {
            return;
        }

        const bookingId = activeBooking.id;

        setBookings((current) =>
            current.map((booking) =>
                booking.id === bookingId
                    ? {
                        ...booking,
                        ...(selectedMeal === "lunch"
                            ? { lunch_delivered: true }
                            : { dinner_delivered: true }),
                    }
                    : booking,
            ),
        );
    }

    function formatDistance(meters: number | null) {
        if (meters == null || !Number.isFinite(meters)) {
            return "Distance unavailable";
        }

        return meters < 1000
            ? `${Math.round(meters)} m`
            : `${(meters / 1000).toFixed(1)} km`;
    }

    function formatDuration(seconds: number | null) {
        if (seconds == null || !Number.isFinite(seconds)) {
            return "";
        }

        const minutes = Math.round(seconds / 60);

        if (minutes < 1) return "Under 1 min";
        if (minutes < 60) return `${minutes} min`;

        const hours = Math.floor(minutes / 60);
        const remaining = minutes % 60;

        return remaining
            ? `${hours} hr ${remaining} min`
            : `${hours} hr`;
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
                locations={bookings
                    .filter((booking) => booking.location)
                    .map((booking) => ({
                        id: booking.id,
                        name: booking.name,
                        username: booking.username,
                        latitude: booking.location.latitude,
                        longitude: booking.location.longitude,
                        road_name: booking.location.road_name,
                    }))}
                selectedLocationId={nextBooking?.id ?? null}
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

            {activeBooking ? (
                <View
                    style={{
                        padding: 14,
                        borderRadius: 10,
                        borderWidth: 1,
                        borderColor: "#2563EB",
                        gap: 8,
                    }}
                >
                    <Text style={{ fontSize: 18, fontWeight: "700" }}>
                        Selected destination
                    </Text>

                    <Text>
                        {activeBooking.name || activeBooking.username}
                    </Text>

                    <Text>
                        {activeBooking.location?.road_name ||
                            "Road name unavailable"}
                    </Text>

                    <Text>
                        {formatDistance(activeBooking.distanceMeters)}
                        {activeBooking.durationSeconds != null &&
                            Number.isFinite(activeBooking.durationSeconds)
                            ? ` · ${formatDuration(activeBooking.durationSeconds)}`
                            : ""}
                    </Text>

                    {isDelivered(activeBooking) ? (
                        <Text>Already delivered</Text>
                    ) : (
                        <Pressable
                            onPress={markDelivered}
                            style={{
                                padding: 12,
                                borderRadius: 8,
                                backgroundColor: "#2563EB",
                                alignItems: "center",
                            }}
                        >
                            <Text style={{ color: "#FFFFFF", fontWeight: "600" }}>
                                Mark Delivered (local only)
                            </Text>
                        </Pressable>
                    )}
                </View>
            ) : null}

            <Text style={{ fontSize: 18, fontWeight: "700" }}>
                Select a destination
            </Text>

            {sortedBookings.map((booking, index) => {
                const delivered = isDelivered(booking);
                const selected = activeBooking?.id === booking.id;

                return (
                    <Pressable
                        key={booking.id}
                        onPress={() => setSelectedBookingId(booking.id)}
                        style={{
                            padding: 12,
                            borderRadius: 10,
                            borderWidth: 1,
                            borderColor: selected ? "#2563EB" : "#E5E7EB",
                            backgroundColor: selected
                                ? "#EFF6FF"
                                : delivered
                                    ? "#F3F4F6"
                                    : "#FFFFFF",
                            gap: 5,
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
                                {index + 1}. {booking.name || booking.username}
                            </Text>

                            <Text
                                style={{
                                    color: delivered ? "#6B7280" : "#166534",
                                    fontWeight: "600",
                                }}
                            >
                                {delivered ? "Delivered" : "Pending"}
                            </Text>
                        </View>

                        <Text>
                            {booking.location?.road_name || "Road name unavailable"}
                        </Text>

                        <Text>
                            {formatDistance(booking.distanceMeters)}
                            {booking.durationSeconds != null &&
                                Number.isFinite(booking.durationSeconds)
                                ? ` · ${formatDuration(booking.durationSeconds)}`
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
