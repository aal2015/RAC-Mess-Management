import { useCallback, useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { View, Text, ScrollView, Pressable } from "react-native";

import { useAuth } from "@/auth/AuthContext";
import {
    getMyRouteAssignment,
    type DriverRouteAssignment,
} from "@/api/routes";

import DeliveryScreen from "@/user/screens/DeliveryScreen";
import { MealType } from "@/user/screens/DeliveryScreen";
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
                today,
            );

            setAssignment(data);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to load your route assignment.",
            );
        } finally {
            setLoading(false);
        }
    }, [accessToken, today]);

    useEffect(() => {
        loadAssignment();
    }, [loadAssignment]);

    function startDelivery() {
        router.push({
            pathname: "/driver/active-delivery",
            params: {
                bookDate: assignment?.book_date ?? today,
                meal: selectedMeal,
                routeNumber: String(
                    assignment?.route?.route_number ?? "",
                ),
                routeUserCount: String(
                    assignment?.route_user_count ?? 0,
                ),
                userCount: String(assignment?.user_count ?? 0),
                lunchCount: String(assignment?.lunch_count ?? 0),
                dinnerCount: String(assignment?.dinner_count ?? 0),
            },
        });
    }

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
                <DeliveryScreen
                    routeNumber={
                        assignment?.route?.route_number ?? null
                    }
                    routeUserCount={
                        assignment?.route_user_count ?? 0
                    }
                    userCount={assignment?.user_count ?? 0}
                    lunchCount={assignment?.lunch_count ?? 0}
                    dinnerCount={assignment?.dinner_count ?? 0}
                    bookDate={assignment?.book_date ?? today}
                    selectedMeal={selectedMeal}
                    onSelectMeal={setSelectedMeal}
                    loading={loading}
                    onStartDelivery={startDelivery}
                />
            )}
        </ScrollView>
    );
}
