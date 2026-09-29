import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { styles } from "../styles/calendar.styles";

type MealStatus = "full" | "partial" | "none";

type CalendarGridProps = {
  month: number; // 0 = January, 11 = December
  year: number;
};

const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function getStatusColor(status: MealStatus) {
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
}: CalendarGridProps) {
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

  const router = useRouter();

  return (
    <View style={styles.calendar}>
      <View style={styles.weekHeader}>
        {weekDays.map((day) => (
          <Text key={day} style={styles.weekDay}>
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
          // Temporary mock status.
          // This will eventually come from the backend.
          const status: MealStatus =
            day % 5 === 0
              ? "none"
              : day % 3 === 0
                ? "partial"
                : "full";

          return (
            <Pressable
              key={day}
              style={[
                styles.dayBox,
                { backgroundColor: getStatusColor(status) },
              ]}
              onPress={() =>
                router.push({
                  pathname: "/booking",
                  params: {
                    date: `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
                  },
                })
              }
            >
              <Text style={styles.dayNumber}>{day}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}