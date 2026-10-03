import {
  View,
  Text,
  Pressable,
  ScrollView,
  ActivityIndicator,
} from "react-native";

import { useCallback, useEffect, useState } from "react";

import {
  useLocalSearchParams,
  useRouter,
} from "expo-router";

import { styles } from "../../user/styles/booking.styles";

import { useAuth } from "../../auth/AuthContext";

import {
  getMealBookings,
  updateMealBooking,
} from "../../api/bookings";

import { UnauthorizedError } from "../../api/admin";

export default function BookingScreen() {
  const router = useRouter();

  const {
    date,
    lunch: lunchParam,
    dinner: dinnerParam,
    username,
    userId,
  } = useLocalSearchParams<
    "/(authenticated)/booking",
    {
      date?: string;
      lunch?: string;
      dinner?: string;
      username?: string;
      userId?: string;
    }
  >();

  const { accessToken, user, logout } = useAuth();

  const [lunch, setLunch] = useState(false);
  const [dinner, setDinner] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const goToCalendar = () => {
    if (user?.role === "admin" && username) {
      router.replace({
        pathname: "/calendar",
        params: {
          userId: userId ?? "",
          username,
        },
      });
    } else {
      router.replace("/calendar");
    }
  };

  const loadBooking = useCallback(async () => {
    if (!accessToken || !date) {
      setIsLoading(false);
      return;
    }

    setError("");

    // Use booking data already loaded by Calendar.
    if (
      lunchParam !== undefined &&
      dinnerParam !== undefined
    ) {
      setLunch(lunchParam === "true");
      setDinner(dinnerParam === "true");
      setIsLoading(false);
      return;
    }

    if (user?.role === "admin" && !username) {
      setError("User information is missing.");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);

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

  async function handleConfirm() {
    if (isSubmitting || !accessToken || !date) {
      return;
    }

    setError("");
    setSuccess("");

    if (user?.role === "admin" && !username) {
      setError("User information is missing.");
      return;
    }

    try {
      setIsSubmitting(true);

      await updateMealBooking(
        accessToken,
        date,
        lunch,
        dinner,
        user?.role === "admin"
          ? username
          : undefined
      );

      setSuccess(
        "Meal booking updated successfully."
      );
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        await logout();
        return;
      }

      setError(
        error instanceof Error
          ? error.message
          : "Failed to update meal booking."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

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
              lunch && styles.takingActive,
            ]}
            onPress={() => {
              setLunch(true);
              setSuccess("");
              setError("");
            }}
          >
            <Text
              style={[
                styles.optionText,
                lunch && styles.whiteText,
              ]}
            >
              Taking
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.option,
              !lunch && styles.notTakingActive,
            ]}
            onPress={() => {
              setLunch(false);
              setSuccess("");
              setError("");
            }}
          >
            <Text
              style={[
                styles.optionText,
                !lunch && styles.whiteText,
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
              dinner && styles.takingActive,
            ]}
            onPress={() => {
              setDinner(true);
              setSuccess("");
              setError("");
            }}
          >
            <Text
              style={[
                styles.optionText,
                dinner && styles.whiteText,
              ]}
            >
              Taking
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.option,
              !dinner && styles.notTakingActive,
            ]}
            onPress={() => {
              setDinner(false);
              setSuccess("");
              setError("");
            }}
          >
            <Text
              style={[
                styles.optionText,
                !dinner && styles.whiteText,
              ]}
            >
              Not Taking
            </Text>
          </Pressable>
        </View>

        {success !== "" && (
          <Text style={styles.successText}>
            {success}
          </Text>
        )}

        {error !== "" && (
          <Text style={styles.errorText}>
            {error}
          </Text>
        )}

        <Text style={styles.cutoffText}>
          This can be changed until the cutoff. After that,
          tomorrow’s meal count is locked in for the mess.
        </Text>

        {success === "" ? (
          <View style={styles.buttonRow}>
            <Pressable
              style={styles.cancelButton}
              onPress={goToCalendar}
              disabled={isSubmitting}
            >
              <Text style={styles.cancelText}>
                Cancel
              </Text>
            </Pressable>

            <Pressable
              style={styles.confirmButton}
              onPress={handleConfirm}
              disabled={isSubmitting}
            >
              <Text style={styles.confirmText}>
                {isSubmitting
                  ? "Updating..."
                  : "Confirm"}
              </Text>
            </Pressable>
          </View>
        ) : (
          <Pressable
            style={styles.confirmButton}
            onPress={goToCalendar}
          >
            <Text style={styles.confirmText}>
              Back to Calendar
            </Text>
          </Pressable>
        )}
      </View>
    </ScrollView>
  );
}