import { useCallback, useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { View, Text, ScrollView, Pressable } from "react-native";

import { useAuth } from "@/auth/AuthContext";
import {
    getMyRouteAssignment,
    type DriverRouteAssignment,
} from "@/api/routes";

import DeliveryScreen, {
    type MealType,
} from "@/user/screens/DeliveryScreen";
import { styles } from "../../user/styles/delivery.styles";
import LogoutButton from "../../components/LogoutButton";

function getLocalDateString() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

export default function Delivery() {
    const router = useRouter();
    const { accessToken } = useAuth();

    const [assignment, setAssignment] =
        useState<DriverRouteAssignment | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [today] = useState(getLocalDateString);

    const [selectedMeal, setSelectedMeal] =
        useState<MealType>("lunch");

    const loadAssignment = useCallback(async () => {
        if (!accessToken) {
            setError("You are not authenticated.");
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const data = await getMyRouteAssignment(
                accessToken,
                today
            );

            setAssignment(data);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to load your route assignment."
            );
        } finally {
            setLoading(false);
        }
    }, [accessToken, today]);

    useEffect(() => {
        loadAssignment();
    }, [loadAssignment]);

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={{ flexGrow: 1 }}
        >
            <View style={styles.header}>
                <Text style={styles.title}>Delivery</Text>
                <LogoutButton />
            </View>

            {error ? (
                <View style={{ padding: 20, alignItems: "center" }}>
                    <Text
                        style={{
                            color: "#DC2626",
                            textAlign: "center",
                            marginBottom: 12,
                        }}
                    >
                        {error}
                    </Text>

                    <Text
                        onPress={loadAssignment}
                        style={{
                            color: "#2563EB",
                            fontWeight: "600",
                        }}
                    >
                        Try Again
                    </Text>
                </View>
            ) : (
                <>
                    <View style={{ paddingHorizontal: 20, paddingTop: 16 }}>
                        <Text style={{ fontSize: 16, fontWeight: "700", marginBottom: 12 }}>
                            Select Delivery Mode
                        </Text>

                        <View style={{ flexDirection: "row", gap: 12 }}>
                            <Pressable
                                onPress={() => setSelectedMeal("lunch")}
                                style={{
                                    flex: 1,
                                    padding: 16,
                                    borderRadius: 12,
                                    borderWidth: 2,
                                    borderColor:
                                        selectedMeal === "lunch" ? "#D97706" : "#E2E8F0",
                                    backgroundColor:
                                        selectedMeal === "lunch" ? "#FFFBEB" : "#FFFFFF",
                                    alignItems: "center",
                                }}
                            >
                                <Text style={{ fontSize: 16, fontWeight: "600" }}>
                                    ☀️ Lunch
                                </Text>
                            </Pressable>

                            <Pressable
                                onPress={() => setSelectedMeal("dinner")}
                                style={{
                                    flex: 1,
                                    padding: 16,
                                    borderRadius: 12,
                                    borderWidth: 2,
                                    borderColor:
                                        selectedMeal === "dinner" ? "#7C3AED" : "#E2E8F0",
                                    backgroundColor:
                                        selectedMeal === "dinner" ? "#F5F3FF" : "#FFFFFF",
                                    alignItems: "center",
                                }}
                            >
                                <Text style={{ fontSize: 16, fontWeight: "600" }}>
                                    🌙 Dinner
                                </Text>
                            </Pressable>
                        </View>
                    </View>

                    <DeliveryScreen
                        routeNumber={assignment?.route?.route_number ?? null}
                        routeUserCount={assignment?.route_user_count ?? 0}
                        userCount={assignment?.user_count ?? 0}
                        lunchCount={assignment?.lunch_count ?? 0}
                        dinnerCount={assignment?.dinner_count ?? 0}
                        bookDate={assignment?.book_date ?? today}
                        selectedMeal={selectedMeal}
                        onSelectMeal={setSelectedMeal}
                        loading={loading}
                        onStartDelivery={() =>
                            router.push({
                                pathname: "/driver/active-delivery",
                                params: { meal: selectedMeal },
                            })
                        }
                    />
                </>
            )}
        </ScrollView>
    );
}