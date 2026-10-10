
import { useMemo, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
    View,
    Text,
    FlatList,
    Pressable,
    StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export type MealType = "lunch" | "dinner";

type ActiveDeliveryProps = {
    routeNumber: number | null;
    routeUserCount: number;
    userCount: number;
    lunchCount: number;
    dinnerCount: number;
    bookDate: string;
    selectedMeal: MealType;
    onSelectMeal: (meal: MealType) => void;
    loading: boolean;
    onBack: () => void;
};

type Booking = {
    id: string;
    name: string;
    landmark: string;
    distanceKm: number;
    delivered: boolean;
};

// Temporary sample data.
// Replace this with bookings fetched from your API.
const SAMPLE_BOOKINGS: Booking[] = [
    {
        id: "1",
        name: "Rajesh Kumar",
        landmark: "Building A",
        distanceKm: 0.3,
        delivered: false,
    },
    {
        id: "2",
        name: "Amit Singh",
        landmark: "Quarter 14",
        distanceKm: 0.7,
        delivered: false,
    },
    {
        id: "3",
        name: "Priya Sharma",
        landmark: "Security Block",
        distanceKm: 1.2,
        delivered: false,
    },
    {
        id: "4",
        name: "Rahul Verma",
        landmark: "Quarter 22",
        distanceKm: 1.8,
        delivered: false,
    },
    {
        id: "5",
        name: "Sunil Kumar",
        landmark: "Main Gate",
        distanceKm: 2.1,
        delivered: false,
    },
];

export default function ActiveDelivery({
    routeNumber,
    routeUserCount,
    userCount,
    lunchCount,
    dinnerCount,
    bookDate,
    selectedMeal,
    onSelectMeal,
    loading,
    onBack,
}: ActiveDeliveryProps) {
    const router = useRouter();

    const [bookings, setBookings] =
        useState<Booking[]>(SAMPLE_BOOKINGS);

    const pendingBookings = useMemo(
        () =>
            bookings
                .filter((booking) => !booking.delivered)
                .sort((a, b) => a.distanceKm - b.distanceKm),
        [bookings]
    );

    const deliveredCount = bookings.filter(
        (booking) => booking.delivered
    ).length;

    const nextBooking = pendingBookings[0];

    function markDelivered() {
        if (!nextBooking) return;

        setBookings((current) =>
            current.map((booking) =>
                booking.id === nextBooking.id
                    ? { ...booking, delivered: true }
                    : booking
            )
        );
    }

    return (
        <View style={styles.screen}>
            {/* Header */}
            <View style={styles.header}>
                <Pressable
                    onPress={onBack}
                    style={styles.backButton}
                >
                    <Ionicons
                        name="arrow-back"
                        size={23}
                        color="#0F172A"
                    />
                </Pressable>

                <View style={styles.headerText}>
                    <Text style={styles.title}>
                        {selectedMeal === "lunch"
                            ? "Lunch Delivery"
                            : "Dinner Delivery"}
                    </Text>

                    <Text style={styles.subtitle}>
                        {deliveredCount} of {bookings.length} delivered
                    </Text>
                </View>

                <View
                    style={[
                        styles.mealBadge,
                        selectedMeal === "dinner" &&
                            styles.dinnerBadge,
                    ]}
                >
                    <Ionicons
                        name={
                            selectedMeal === "lunch"
                                ? "sunny-outline"
                                : "moon-outline"
                        }
                        size={21}
                        color={
                            selectedMeal === "lunch"
                                ? "#D97706"
                                : "#7C3AED"
                        }
                    />
                </View>
            </View>

            {/* Scrollable booking list with fixed height */}
            <View style={styles.bookingSection}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>
                        Meal Bookings
                    </Text>

                    <Text style={styles.remainingText}>
                        {pendingBookings.length} remaining
                    </Text>
                </View>

                <View style={styles.bookingList}>
                    <FlatList
                        data={bookings}
                        keyExtractor={(item) => item.id}
                        showsVerticalScrollIndicator
                        contentContainerStyle={styles.listContent}
                        renderItem={({ item, index }) => (
                            <View style={styles.bookingRow}>
                                <View
                                    style={[
                                        styles.numberCircle,
                                        item.delivered &&
                                            styles.deliveredCircle,
                                    ]}
                                >
                                    {item.delivered ? (
                                        <Ionicons
                                            name="checkmark"
                                            size={18}
                                            color="#FFFFFF"
                                        />
                                    ) : (
                                        <Text style={styles.numberText}>
                                            {index + 1}
                                        </Text>
                                    )}
                                </View>

                                <View style={styles.bookingInfo}>
                                    <Text
                                        style={[
                                            styles.bookingName,
                                            item.delivered &&
                                                styles.completedText,
                                        ]}
                                    >
                                        {item.name}
                                    </Text>

                                    <Text style={styles.landmark}>
                                        {item.landmark}
                                    </Text>

                                    <Text style={styles.distance}>
                                        {item.distanceKm.toFixed(1)} km away
                                    </Text>
                                </View>

                                <View
                                    style={[
                                        styles.statusBadge,
                                        item.delivered
                                            ? styles.statusDone
                                            : item.id === nextBooking?.id
                                              ? styles.statusNext
                                              : styles.statusPending,
                                    ]}
                                >
                                    <Text
                                        style={[
                                            styles.statusText,
                                            item.delivered &&
                                                styles.statusDoneText,
                                            !item.delivered &&
                                                item.id === nextBooking?.id &&
                                                styles.statusNextText,
                                        ]}
                                    >
                                        {item.delivered
                                            ? "Delivered"
                                            : item.id === nextBooking?.id
                                              ? "Next"
                                              : "Pending"}
                                    </Text>
                                </View>
                            </View>
                        )}
                        ListEmptyComponent={
                            <Text style={styles.emptyText}>
                                No bookings found.
                            </Text>
                        }
                    />
                </View>
            </View>

            {/* Current delivery action */}
            <View style={styles.actionSection}>
                {nextBooking ? (
                    <>
                        <View style={styles.nextStop}>
                            <Ionicons
                                name="navigate-outline"
                                size={21}
                                color="#2563EB"
                            />

                            <View style={styles.nextStopInfo}>
                                <Text style={styles.nextStopLabel}>
                                    NEXT DELIVERY
                                </Text>
                                <Text style={styles.nextStopName}>
                                    {nextBooking.name}
                                </Text>
                            </View>
                        </View>

                        <Pressable
                            onPress={markDelivered}
                            style={({ pressed }) => [
                                styles.deliveredButton,
                                pressed && styles.buttonPressed,
                            ]}
                        >
                            <Ionicons
                                name="checkmark-circle-outline"
                                size={21}
                                color="#FFFFFF"
                            />
                            <Text style={styles.deliveredButtonText}>
                                Mark Delivered
                            </Text>
                        </Pressable>
                    </>
                ) : (
                    <View style={styles.completedBanner}>
                        <Ionicons
                            name="checkmark-circle"
                            size={25}
                            color="#15803D"
                        />
                        <Text style={styles.completedBannerText}>
                            All deliveries completed!
                        </Text>
                    </View>
                )}
            </View>

            {/* Map placeholder: replace with your native map component */}
            <View style={styles.mapContainer}>
                <View style={styles.mapHeader}>
                    <Text style={styles.mapTitle}>Delivery Map</Text>
                    <Ionicons
                        name="map-outline"
                        size={21}
                        color="#334155"
                    />
                </View>

                <View style={styles.mapPlaceholder}>
                    <Ionicons
                        name="location-outline"
                        size={42}
                        color="#2563EB"
                    />

                    <Text style={styles.mapPlaceholderTitle}>
                        Map will appear here
                    </Text>

                    <Text style={styles.mapPlaceholderText}>
                        Driver location and delivery stops
                        will be shown on the map.
                    </Text>
                </View>
            </View>
        </View>
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
