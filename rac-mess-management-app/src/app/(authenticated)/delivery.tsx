import { useCallback, useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { View, Text, ScrollView, } from "react-native";

import { useAuth } from "@/auth/AuthContext";
import {
    getMyRouteAssignment,
    type DriverRouteAssignment,
} from "@/api/routes";
import {
    getActiveTrackingSession,
    startTrackingSession,
} from "@/api/tracking";
import { getCurrentBrowserLocation } from "@/utils/location";

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

    const [startingDelivery, setStartingDelivery] = useState(false);
    const [startError, setStartError] = useState<string | null>(null);

    const loadAssignment = useCallback(async () => {
        if (!accessToken) {
            setError("You are not authenticated.");
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            // First, check whether the driver already has an active session.
            const activeResponse = await getActiveTrackingSession(accessToken);

            if (
                activeResponse.has_active_session &&
                activeResponse.session
            ) {
                const session = activeResponse.session;

                // Restore the existing delivery instead of starting a new one.
                router.replace({
                    pathname: "/driver/active-delivery",
                    params: {
                        sessionId: session.id,
                        bookDate: session.book_date,
                        meal: session.meal_type,
                    },
                });

                return;
            }

            // No active session: load the normal route assignment.
            const data = await getMyRouteAssignment(
                accessToken,
                today,
            );

            setAssignment(data);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to load delivery information.",
            );
        } finally {
            setLoading(false);
        }
    }, [accessToken, today, router]);

    useEffect(() => {
        loadAssignment();
    }, [loadAssignment]);

    async function startDelivery() {
        if (!accessToken) {
            setStartError("You are not authenticated.");
            return;
        }

        if (!assignment?.route?.id) {
            setStartError("No route is assigned to you.");
            return;
        }

        try {
            setStartingDelivery(true);
            setStartError(null);

            // Get the driver's initial location.
            const location = await getCurrentBrowserLocation();

            // Create the tracking session in the backend.
            const session = await startTrackingSession(accessToken, {
                route_id: assignment.route.id,
                book_date: assignment.book_date,
                meal_type: selectedMeal,
                latitude: location.latitude,
                longitude: location.longitude,
            });

            // Navigate only after the session has been created.
            router.replace({
                pathname: "/driver/active-delivery",
                params: {
                    sessionId: session.id,
                    bookDate: session.book_date,
                    meal: session.meal_type,
                    session: JSON.stringify(session),

                    routeNumber: String(
                        assignment.route.route_number ?? ""
                    ),
                    routeUserCount: String(assignment.route_user_count),
                    userCount: String(assignment.user_count),
                    lunchCount: String(assignment.lunch_count),
                    dinnerCount: String(assignment.dinner_count),
                },
            });
        } catch (error) {
            setStartError(
                error instanceof Error
                    ? error.message
                    : "Failed to start delivery."
            );
        } finally {
            setStartingDelivery(false);
        }
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
                    startingDelivery={startingDelivery}
                    startError={startError}
                />
            )}
        </ScrollView>
    );
}
