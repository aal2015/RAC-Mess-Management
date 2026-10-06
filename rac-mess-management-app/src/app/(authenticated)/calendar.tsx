import {
    View,
    Text,
    ScrollView,
    ActivityIndicator,
    Pressable
} from "react-native";
import { useCallback, useState } from "react";
import {
    useFocusEffect,
    useLocalSearchParams,
} from "expo-router";
import { styles } from "../../user/styles/calendar.styles";
import CalendarGrid from "../../user/components/CalendarGrid";
import { useAuth } from "../../auth/AuthContext";
import LogoutButton from "../../components/LogoutButton";
import {
    getMealBookings,
    createMealBookings,
    type MealBooking,
} from "../../api/bookings";
import { UnauthorizedError } from "../../api/admin";

export default function CalendarScreen() {
    const { userId, username } = useLocalSearchParams<
        "/(authenticated)/calendar",
        {
            userId?: string;
            username?: string;
        }
    >();

    const { accessToken, user, logout } = useAuth();

    const [bookings, setBookings] = useState<
        MealBooking[]
    >([]);

    const [isInitializing, setIsInitializing] =
        useState(false);
    const [initializeMessage, setInitializeMessage] =
        useState("");

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    const currentDate = new Date();

    const month = currentDate.getMonth();
    const year = currentDate.getFullYear();

    const monthName = currentDate.toLocaleString("en-US", {
        month: "long",
    });

    const loadBookings = useCallback(async () => {
        if (!accessToken) {
            return;
        }

        if (user?.role === "admin" && !username) {
            setError("User information is missing.");
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);
            setError("");

            const data = await getMealBookings(
                accessToken,
                user?.role === "admin"
                    ? username
                    : undefined
            );

            setBookings(data);
        } catch (error) {
            if (error instanceof UnauthorizedError) {
                await logout();
                return;
            }

            setError(
                error instanceof Error
                    ? error.message
                    : "Failed to load meal bookings."
            );
        } finally {
            setIsLoading(false);
        }
    }, [accessToken, user?.role, username, logout]);

    useFocusEffect(
        useCallback(() => {
            loadBookings();
        }, [loadBookings])
    );

    const bookingMap = bookings.reduce<
        Record<
            string,
            {
                lunch: boolean;
                dinner: boolean;
            }
        >
    >((map, booking) => {
        map[booking.book_date] = {
            lunch: booking.lunch,
            dinner: booking.dinner,
        };

        return map;
    }, {});

    const totalMeals = bookings.reduce(
        (total, booking) => {
            return (
                total +
                (booking.lunch ? 1 : 0) +
                (booking.dinner ? 1 : 0)
            );
        },
        0
    );

    async function handleInitializeRemainingDates() {
        if (
            isInitializing ||
            !accessToken ||
            user?.role !== "admin" ||
            !username
        ) {
            return;
        }

        setInitializeMessage("");
        setError("");

        try {
            setIsInitializing(true);

            // Dates already initialized in the backend
            const existingDates = new Set(
                bookings.map(
                    (booking) => booking.book_date
                )
            );

            const missingDates: string[] = [];

            // Get today's date using local time
            const today = new Date();

            const todayString = `${today.getFullYear()}-${String(
                today.getMonth() + 1
            ).padStart(2, "0")}-${String(
                today.getDate()
            ).padStart(2, "0")}`;

            const daysInMonth = new Date(
                year,
                month + 1,
                0
            ).getDate();

            for (
                let day = 1;
                day <= daysInMonth;
                day++
            ) {
                const currentDate = new Date(
                    year,
                    month,
                    day
                );

                const dateString = `${year}-${String(
                    month + 1
                ).padStart(2, "0")}-${String(
                    day
                ).padStart(2, "0")}`;

                const dayOfWeek =
                    currentDate.getDay();

                const isWeekend =
                    dayOfWeek === 0 ||
                    dayOfWeek === 6;

                const isPast =
                    dateString < todayString;

                const alreadyInitialized =
                    existingDates.has(dateString);

                if (
                    !isPast &&
                    !isWeekend &&
                    !alreadyInitialized
                ) {
                    missingDates.push(dateString);
                }
            }

            if (missingDates.length === 0) {
                setInitializeMessage(
                    "No remaining dates need to be initialized."
                );
                return;
            }

            await createMealBookings(
                accessToken,
                username,
                missingDates,
                true,
                true
            );

            setInitializeMessage(
                `${missingDates.length} dates initialized successfully.`
            );

            // Refresh the calendar data
            await loadBookings();
        } catch (error) {
            if (error instanceof UnauthorizedError) {
                await logout();
                return;
            }

            setError(
                error instanceof Error
                    ? error.message
                    : "Failed to initialize remaining dates."
            );
        } finally {
            setIsInitializing(false);
        }
    }

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.contentContainer}
        >
            <View style={styles.header}>
                <View style={styles.headerText}>
                    <Text style={styles.title}>
                        Diet Calendar
                    </Text>

                    <Text style={styles.month}>
                        {monthName} {year}
                    </Text>

                    {user?.role === "admin" && username && (
                        <Text style={styles.month}>
                            {username}
                        </Text>
                    )}
                </View>

                <LogoutButton />
            </View>

            <View style={styles.content}>
                {isLoading ? (
                    <ActivityIndicator size="large" />
                ) : error ? (
                    <Text style={styles.errorText}>
                        {error}
                    </Text>
                ) : (
                    <>
                        {user?.role === "admin" && (
                            <>
                                <Pressable
                                    style={styles.initializeButton}
                                    onPress={handleInitializeRemainingDates}
                                    disabled={isInitializing}
                                >
                                    <Text
                                        style={styles.initializeButtonText}
                                    >
                                        {isInitializing
                                            ? "Initializing..."
                                            : "Initialize Remaining Dates"}
                                    </Text>
                                </Pressable>

                                {initializeMessage !== "" && (
                                    <Text style={styles.successText}>
                                        {initializeMessage}
                                    </Text>
                                )}
                            </>
                        )}
                        <CalendarGrid
                            month={month}
                            year={year}
                            bookings={bookingMap}
                            username={
                                user?.role === "admin"
                                    ? username
                                    : undefined
                            }
                        />

                        <View style={styles.legend}>
                            <View style={styles.legendItem}>
                                <View
                                    style={[
                                        styles.legendBox,
                                        styles.fullMeal,
                                    ]}
                                />

                                <Text style={styles.legendText}>
                                    2 meals
                                </Text>
                            </View>

                            <View style={styles.legendItem}>
                                <View
                                    style={[
                                        styles.legendBox,
                                        styles.partialMeal,
                                    ]}
                                />

                                <Text style={styles.legendText}>
                                    1 meal
                                </Text>
                            </View>

                            <View style={styles.legendItem}>
                                <View
                                    style={[
                                        styles.legendBox,
                                        styles.noMeal,
                                    ]}
                                />

                                <Text style={styles.legendText}>
                                    0 meals
                                </Text>
                            </View>

                            <View style={styles.legendItem}>
                                <View
                                    style={[
                                        styles.legendBox,
                                        styles.noBooking,
                                    ]}
                                />

                                <Text style={styles.legendText}>
                                    No booking
                                </Text>
                            </View>
                        </View>

                        <View style={styles.totalSection}>
                            <Text style={styles.totalLabel}>
                                {monthName} Total
                            </Text>

                            <Text style={styles.totalValue}>
                                {totalMeals} diets
                            </Text>
                        </View>
                    </>
                )}
            </View>
        </ScrollView>
    );
}