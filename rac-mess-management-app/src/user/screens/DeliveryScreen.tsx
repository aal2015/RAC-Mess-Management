
import {
    View,
    Text,
    Pressable,
    ActivityIndicator,
    StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export type MealType = "lunch" | "dinner";

type DeliveryScreenProps = {
    routeNumber: number | null;
    routeUserCount: number;
    userCount: number;
    lunchCount: number;
    dinnerCount: number;
    bookDate: string;
    selectedMeal: MealType;
    onSelectMeal: (meal: MealType) => void;
    loading?: boolean;
    onStartDelivery: () => void;
};

function formatDate(dateString: string) {
    const [year, month, day] = dateString.split("-").map(Number);

    return new Date(year, month - 1, day).toLocaleDateString("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
    });
}

export default function DeliveryScreen({
    routeNumber,
    routeUserCount,
    userCount,
    lunchCount,
    dinnerCount,
    bookDate,
    selectedMeal,
    onSelectMeal,
    loading = false,
    onStartDelivery,
}: DeliveryScreenProps) {
    const hasRoute = routeNumber !== null;
    const hasDeliveries = userCount > 0;
    const canStart = hasRoute && hasDeliveries && !loading;

    return (
        <View style={styles.container}>
            <View style={styles.dateHeader}>
                <Text style={styles.dateLabel}>TODAY'S DELIVERIES</Text>
                <Text style={styles.dateText}>
                    {formatDate(bookDate)}
                </Text>
            </View>

            {loading ? (
                <View style={styles.messageCard}>
                    <ActivityIndicator size="large" color="#2563EB" />
                    <Text style={styles.messageText}>
                        Loading delivery details...
                    </Text>
                </View>
            ) : !hasRoute ? (
                <View style={styles.messageCard}>
                    <Ionicons
                        name="map-outline"
                        size={36}
                        color="#64748B"
                    />
                    <Text style={styles.messageTitle}>
                        No Route Assigned
                    </Text>
                    <Text style={styles.messageText}>
                        No route has been assigned to you by the admin.
                        Please contact the admin for assistance.
                    </Text>
                </View>
            ) : (
                <>
                    <View style={styles.routeCard}>
                        <Text style={styles.label}>
                            YOUR ASSIGNED ROUTE
                        </Text>

                        <Text style={styles.routeNumber}>
                            Route {String(routeNumber).padStart(2, "0")}
                        </Text>

                        <View style={styles.divider} />

                        <View style={styles.peopleRow}>
                            <View style={styles.peopleIcon}>
                                <Ionicons
                                    name="people-outline"
                                    size={25}
                                    color="#2563EB"
                                />
                            </View>
                            <View>
                                <Text style={styles.count}>
                                    {routeUserCount}
                                </Text>
                                <Text style={styles.countLabel}>
                                    People assigned to route
                                </Text>
                            </View>
                        </View>
                    </View>

                    <Text style={styles.sectionTitle}>
                        Today's Meal Deliveries
                    </Text>

                    <View style={styles.mealRow}>
                        <View style={styles.mealCard}>
                            <View style={styles.mealIcon}>
                                <Ionicons
                                    name="sunny-outline"
                                    size={23}
                                    color="#D97706"
                                />
                            </View>
                            <Text style={styles.mealTitle}>Lunch</Text>
                            <Text style={styles.mealCount}>
                                {lunchCount}
                            </Text>
                            <Text style={styles.mealCaption}>
                                {lunchCount === 1
                                    ? "person"
                                    : "people"}
                            </Text>
                        </View>

                        <View style={styles.mealCard}>
                            <View
                                style={[
                                    styles.mealIcon,
                                    styles.dinnerIcon,
                                ]}
                            >
                                <Ionicons
                                    name="moon-outline"
                                    size={23}
                                    color="#7C3AED"
                                />
                            </View>
                            <Text style={styles.mealTitle}>Dinner</Text>
                            <Text style={styles.mealCount}>
                                {dinnerCount}
                            </Text>
                            <Text style={styles.mealCaption}>
                                {dinnerCount === 1
                                    ? "person"
                                    : "people"}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.totalCard}>
                        <Ionicons
                            name="restaurant-outline"
                            size={22}
                            color="#2563EB"
                        />
                        <View style={styles.totalTextContainer}>
                            <Text style={styles.totalTitle}>
                                People to deliver to
                            </Text>
                            <Text style={styles.totalSubtitle}>
                                Unique people who booked lunch or dinner
                            </Text>
                        </View>
                        <Text style={styles.totalCount}>{userCount}</Text>
                    </View>

                    {!hasDeliveries && (
                        <Text style={styles.noDeliveriesText}>
                            No meal deliveries are scheduled for today.
                        </Text>
                    )}
                </>
            )}

            <Pressable
                accessibilityRole="button"
                accessibilityState={{ disabled: !canStart }}
                disabled={!canStart}
                onPress={onStartDelivery}
                style={({ pressed }) => [
                    styles.startButton,
                    !canStart && styles.startButtonDisabled,
                    pressed && canStart && styles.startButtonPressed,
                ]}
            >
                <Ionicons
                    name="navigate-outline"
                    size={22}
                    color="#FFFFFF"
                />
                <Text style={styles.startButtonText}>
                    Start Delivery
                </Text>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        gap: 18,
    },
    dateHeader: {
        gap: 5,
        marginBottom: 4,
    },
    dateLabel: {
        fontSize: 11,
        fontWeight: "700",
        letterSpacing: 1,
        color: "#64748B",
    },
    dateText: {
        fontSize: 15,
        color: "#334155",
    },
    routeCard: {
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: "#E2E8F0",
        borderRadius: 18,
        padding: 20,
    },
    label: {
        fontSize: 11,
        fontWeight: "700",
        letterSpacing: 1,
        color: "#64748B",
    },
    routeNumber: {
        fontSize: 27,
        fontWeight: "700",
        color: "#0F172A",
        marginTop: 8,
    },
    divider: {
        height: 1,
        backgroundColor: "#E2E8F0",
        marginVertical: 18,
    },
    peopleRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    peopleIcon: {
        width: 48,
        height: 48,
        borderRadius: 13,
        backgroundColor: "#DBEAFE",
        alignItems: "center",
        justifyContent: "center",
    },
    count: {
        fontSize: 23,
        fontWeight: "700",
        color: "#0F172A",
    },
    countLabel: {
        fontSize: 12,
        color: "#64748B",
        marginTop: 3,
    },
    sectionTitle: {
        fontSize: 17,
        fontWeight: "700",
        color: "#0F172A",
        marginTop: 2,
    },
    mealRow: {
        flexDirection: "row",
        gap: 12,
    },
    mealCard: {
        flex: 1,
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: "#E2E8F0",
        borderRadius: 16,
        padding: 16,
        gap: 6,
    },
    mealIcon: {
        width: 42,
        height: 42,
        borderRadius: 12,
        backgroundColor: "#FEF3C7",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 4,
    },
    dinnerIcon: {
        backgroundColor: "#EDE9FE",
    },
    mealTitle: {
        fontSize: 14,
        fontWeight: "600",
        color: "#334155",
    },
    mealCount: {
        fontSize: 27,
        fontWeight: "700",
        color: "#0F172A",
    },
    mealCaption: {
        fontSize: 12,
        color: "#64748B",
    },
    totalCard: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        backgroundColor: "#EFF6FF",
        borderRadius: 14,
        padding: 15,
    },
    totalTextContainer: {
        flex: 1,
        gap: 4,
    },
    totalTitle: {
        fontSize: 14,
        fontWeight: "600",
        color: "#1E3A8A",
    },
    totalSubtitle: {
        fontSize: 11,
        lineHeight: 16,
        color: "#1D4ED8",
    },
    totalCount: {
        fontSize: 23,
        fontWeight: "700",
        color: "#1D4ED8",
    },
    messageCard: {
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: "#E2E8F0",
        borderRadius: 18,
        padding: 26,
    },
    messageTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#0F172A",
        textAlign: "center",
    },
    messageText: {
        fontSize: 13,
        lineHeight: 20,
        color: "#64748B",
        textAlign: "center",
    },
    noDeliveriesText: {
        fontSize: 13,
        color: "#64748B",
        textAlign: "center",
    },
    startButton: {
        minHeight: 54,
        borderRadius: 15,
        backgroundColor: "#2563EB",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 10,
        marginTop: "auto",
    },
    startButtonDisabled: {
        backgroundColor: "#CBD5E1",
    },
    startButtonPressed: {
        backgroundColor: "#1D4ED8",
    },
    startButtonText: {
        fontSize: 16,
        fontWeight: "700",
        color: "#FFFFFF",
    },
});
