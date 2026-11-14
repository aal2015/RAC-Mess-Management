
import {
  View,
  Text,
  ScrollView,
  useWindowDimensions,
  ActivityIndicator,
  Pressable,
} from "react-native";
import { useEffect, useState } from "react";
import { useRouter } from "expo-router";

import { useAuth } from "../../auth/AuthContext";
import ScreenHeader from "@/components/ScreenHeader";

import { getMealBooking, MealBookingResponse } from "../../api/users";
import { getActiveTrackingSession, type TrackingSession } from "../../api/tracking";

import { styles } from "../styles/home.styles";

// Returns local date in YYYY-MM-DD format.
function getLocalDate() {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function MealCard({
  title,
  booked,
}: {
  title: string;
  booked: boolean;
}) {
  return (
    <View
      style={{
        backgroundColor: "#FFFFFF",
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <View>
        <Text style={{ fontSize: 16, fontWeight: "600" }}>
          {title}
        </Text>

        <Text style={{ color: "#6B7280", marginTop: 4 }}>
          {booked ? "Meal booked for today" : "No booking for today"}
        </Text>
      </View>

      <Text
        style={{
          color: booked ? "#16A34A" : "#6B7280",
          fontWeight: "600",
        }}
      >
        {booked ? "Booked" : "Not booked"}
      </Text>
    </View>
  );
}

export default function UserHomeScreen() {
  const { width } = useWindowDimensions();
  const { user, accessToken } = useAuth();

  const router = useRouter();

  const isMobile = width < 768;

  const [booking, setBooking] =
    useState<MealBookingResponse | null>(null);

  const [trackingSession, setTrackingSession] =
    useState<TrackingSession | null>(null);

  const [bookingLoading, setBookingLoading] = useState(true);
  const [trackingLoading, setTrackingLoading] = useState(true);

  const [bookingError, setBookingError] = useState<string | null>(null);
  const [trackingError, setTrackingError] = useState<string | null>(null);

  useEffect(() => {
    if (!accessToken) return;

    let cancelled = false;

    async function loadHomeData() {
      const today = getLocalDate();

      // Fetch meal booking.
      const bookingRequest = getMealBooking(accessToken!, today);

      // Fetch active tracking session.
      const trackingRequest =
        getActiveTrackingSession(accessToken!);

      const [bookingResult, trackingResult] = await Promise.allSettled([
        bookingRequest,
        trackingRequest,
      ]);

      if (cancelled) return;

      // Handle booking result.
      if (bookingResult.status === "fulfilled") {
        setBooking(bookingResult.value);
        setBookingError(null);
      } else {
        setBookingError("Unable to load today's meal booking.");
      }

      setBookingLoading(false);

      // Handle tracking result.
      if (trackingResult.status === "fulfilled") {
        const result = trackingResult.value;

        setTrackingSession(
          result.has_active_session
            ? result.session
            : null
        );

        setTrackingError(null);
      } else {
        setTrackingError("Unable to load delivery information.");
      }

      setTrackingLoading(false);
    }

    loadHomeData();

    return () => {
      cancelled = true;
    };
  }, [accessToken]);

  function handleTrackDelivery() {
    if (!trackingSession) return;

    router.push({
      pathname: "/tracking/user-tracking",
      params: {
        sessionId: trackingSession.id,
      },
    });
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      {/* Header */}
      <ScreenHeader
        name={user?.name}
        subtitle={`${user?.username ?? "-"} • ${user?.battalion ?? "-"}`}
        showGreeting
      />

      <View style={styles.content}>

        {/* Today's Meals */}
        <View style={{ marginBottom: 24 }}>
          <Text
            style={{
              fontSize: 20,
              fontWeight: "700",
              marginBottom: 16,
            }}
          >
            Today's Meals
          </Text>

          {bookingLoading ? (
            <ActivityIndicator />
          ) : bookingError ? (
            <Text style={{ color: "#DC2626" }}>
              {bookingError}
            </Text>
          ) : (
            <>
              <MealCard
                title="Lunch"
                booked={booking?.lunch ?? false}
              />

              <MealCard
                title="Dinner"
                booked={booking?.dinner ?? false}
              />
            </>
          )}
        </View>

        {/* Delivery Tracking */}
        <View>
          <Text
            style={{
              fontSize: 20,
              fontWeight: "700",
              marginBottom: 16,
            }}
          >
            Delivery Tracking
          </Text>

          {trackingLoading ? (
            <ActivityIndicator />
          ) : trackingError ? (
            <Text style={{ color: "#DC2626" }}>
              {trackingError}
            </Text>
          ) : trackingSession ? (
            <View
              style={{
                backgroundColor: "#FFFFFF",
                padding: 16,
                borderRadius: 12,
                gap: 12,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    fontSize: 17,
                    fontWeight: "700",
                  }}
                >
                  Active Delivery
                </Text>

                <Text
                  style={{
                    color: "#16A34A",
                    fontWeight: "600",
                  }}
                >
                  On the way
                </Text>
              </View>

              <Text style={{ color: "#6B7280" }}>
                {trackingSession.meal_type === "lunch"
                  ? "Lunch"
                  : "Dinner"} delivery
              </Text>

              <Pressable
                onPress={handleTrackDelivery}
                style={{
                  backgroundColor: "#2563EB",
                  padding: 14,
                  borderRadius: 10,
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    color: "#FFFFFF",
                    fontWeight: "600",
                  }}
                >
                  Track Driver
                </Text>
              </Pressable>
            </View>
          ) : (
            <Text style={{ color: "#6B7280" }}>
              No active delivery at the moment.
            </Text>
          )}
        </View>
      </View>
    </ScrollView>
  );
}
