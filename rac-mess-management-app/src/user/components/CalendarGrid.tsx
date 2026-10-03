import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";

import { styles } from "../styles/calendar.styles";

type MealStatus = "full" | "partial" | "none";

type Booking = {
  lunch: boolean;
  dinner: boolean;
};

type CalendarGridProps = {
  month: number;
  year: number;
  bookings: Record<
    string,
    {
      lunch: boolean;
      dinner: boolean;
    }
  >;
  username?: string;
};

const weekDays = [
  "Sun",
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
];

function getStatus(
  booking?: Booking
): MealStatus {
  if (!booking) {
    return "none";
  }

  if (booking.lunch && booking.dinner) {
    return "full";
  }

  if (booking.lunch || booking.dinner) {
    return "partial";
  }

  return "none";
}

function getStatusColor(
  status: MealStatus
) {
  switch (status) {
    case "full":
      return "#DCFCE7";

    case "partial":
      return "#FEF3C7";

    case "none":
      return "#FEE2E2";
  }
}

export default function CalendarGrid({
  month,
  year,
  bookings,
  username,
}: CalendarGridProps) {
  const router = useRouter();

  const daysInMonth = new Date(
    year,
    month + 1,
    0
  ).getDate();

  const startingDay = new Date(
    year,
    month,
    1
  ).getDay();

  const days = Array.from(
    { length: daysInMonth },
    (_, index) => index + 1
  );

  const emptyDays = Array.from(
    { length: startingDay },
    (_, index) => index
  );

  return (
    <View style={styles.calendar}>
      <View style={styles.weekHeader}>
        {weekDays.map((day) => (
          <Text
            key={day}
            style={styles.weekDay}
          >
            {day}
          </Text>
        ))}
      </View>

      <View style={styles.daysGrid}>
        {emptyDays.map((day) => (
          <View
            key={`empty-${day}`}
            style={styles.emptyDay}
          />
        ))}

        {days.map((day) => {
          const date = `${year}-${String(
            month + 1
          ).padStart(2, "0")}-${String(day).padStart(
            2,
            "0"
          )}`;

          const booking = bookings[date];

          const status = getStatus(
            booking
          );

          return (
            <Pressable
              key={day}
              style={[
                styles.dayBox,
                {
                  backgroundColor:
                    getStatusColor(status),
                },
              ]}
              onPress={() => {
                const booking = bookings[date];

                router.push({
                  pathname: "/booking",
                  params: {
                    date,
                    lunch: String(booking?.lunch ?? false),
                    dinner: String(booking?.dinner ?? false),
                    ...(username ? { username } : {}),
                  },
                });
              }}
            >
              <Text style={styles.dayNumber}>
                {day}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}