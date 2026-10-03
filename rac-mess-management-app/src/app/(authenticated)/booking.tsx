import {
    View,
    Text,
    Pressable,
    ScrollView,
    ActivityIndicator,
} from "react-native";

import { useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";

import { styles } from "../../user/styles/booking.styles";

import { useAuth } from "../../auth/AuthContext";

import {
    getMealBookings,
    type MealBooking,
} from "../../api/bookings";

import { UnauthorizedError } from "../../api/admin";

export default function BookingScreen() {
    const {
        date,
        lunch: lunchParam,
        dinner: dinnerParam,
        username,
    } = useLocalSearchParams<
        "/(authenticated)/booking",
        {
            date?: string;
            lunch?: string;
            dinner?: string;
            username?: string;
        }
    >();

    const { accessToken, user, logout } = useAuth();

    const [lunch, setLunch] = useState(false);
    const [dinner, setDinner] = useState(false);

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    const loadBooking = useCallback(async () => {
        if (!accessToken || !date) {
            return;
        }

        // Booking data was already loaded by Calendar.
        if (
            lunchParam !== undefined &&
            dinnerParam !== undefined
        ) {
            setLunch(lunchParam === "true");
            setDinner(dinnerParam === "true");
            setIsLoading(false);
            return;
        }

        // Admin needs the selected user's username.
        if (user?.role === "admin" && !username) {
            setError("User information is missing.");
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);
            setError("");

            const bookings = await getMealBookings(
                accessToken,
                user?.role === "admin"
                    ? username
                    : undefined
            );

            const booking = bookings.find(
                (item) => item.book_date === date
            );

            if (booking) {
                setLunch(booking.lunch);
                setDinner(booking.dinner);
            } else {
                setLunch(false);
                setDinner(false);
            }
        } catch (error) {
            if (error instanceof UnauthorizedError) {
                await logout();
                return;
            }

            setError(
                error instanceof Error
                    ? error.message
                    : "Failed to load meal booking."
            );
        } finally {
            setIsLoading(false);
        }
    }, [
        accessToken,
        date,
        lunchParam,
        dinnerParam,
        username,
        user?.role,
        logout,
    ]);

    useEffect(() => {
        loadBooking();
    }, [loadBooking]);

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.contentContainer}
        >
            <View style={styles.header}>
                <Text style={styles.title}>
                    Meal Booking
                </Text>

                <Text style={styles.date}>
                    {date}
                </Text>

                {user?.role === "admin" && username && (
                    <Text style={styles.date}>
                        {username}
                    </Text>
                )}
            </View>

            <View style={styles.card}>
                <Text style={styles.label}>
                    Lunch
                </Text>

                <View style={styles.toggleRow}>
                    <Pressable
                        style={[
                            styles.option,
                            lunch &&
                                styles.takingActive,
                        ]}
                        onPress={() =>
                            setLunch(true)
                        }
                    >
                        <Text
                            style={[
                                styles.optionText,
                                lunch &&
                                    styles.whiteText,
                            ]}
                        >
                            Taking
                        </Text>
                    </Pressable>

                    <Pressable
                        style={[
                            styles.option,
                            !lunch &&
                                styles.notTakingActive,
                        ]}
                        onPress={() =>
                            setLunch(false)
                        }
                    >
                        <Text
                            style={[
                                styles.optionText,
                                !lunch &&
                                    styles.whiteText,
                            ]}
                        >
                            Not Taking
                        </Text>
                    </Pressable>
                </View>

                <Text style={styles.label}>
                    Dinner
                </Text>

                <View style={styles.toggleRow}>
                    <Pressable
                        style={[
                            styles.option,
                            dinner &&
                                styles.takingActive,
                        ]}
                        onPress={() =>
                            setDinner(true)
                        }
                    >
                        <Text
                            style={[
                                styles.optionText,
                                dinner &&
                                    styles.whiteText,
                            ]}
                        >
                            Taking
                        </Text>
                    </Pressable>

                    <Pressable
                        style={[
                            styles.option,
                            !dinner &&
                                styles.notTakingActive,
                        ]}
                        onPress={() =>
                            setDinner(false)
                        }
                    >
                        <Text
                            style={[
                                styles.optionText,
                                !dinner &&
                                    styles.whiteText,
                            ]}
                        >
                            Not Taking
                        </Text>
                    </Pressable>
                </View>

                {error !== "" && (
                    <Text style={styles.errorText}>
                        {error}
                    </Text>
                )}

                <Text style={styles.cutoffText}>
                    This can be changed until the cutoff.
                    After that, tomorrow’s meal count is
                    locked in for the mess.
                </Text>

                <Pressable
                    style={styles.confirmButton}
                    onPress={() => {
                        console.log({
                            date,
                            lunch,
                            dinner,
                            username,
                        });

                        // TODO:
                        // PUT booking to backend
                    }}
                >
                    <Text style={styles.confirmText}>
                        Confirm
                    </Text>
                </Pressable>
            </View>
        </ScrollView>
    );
}