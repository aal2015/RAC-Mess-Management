import { View, Text, Pressable } from "react-native";
import { styles } from "../styles/home.styles";

type BusCardProps = {
  busNumber?: string;
  driverName?: string;
  route?: string;
  startedAt?: string;
};

export default function BusCard({
  busNumber,
  driverName,
  route,
  startedAt,
}: BusCardProps) {
  const hasBus = busNumber && driverName;

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Your Bus</Text>

      {hasBus ? (
        <>
          <View style={styles.busInfo}>
            <View>
              <Text style={styles.busNumber}>{busNumber}</Text>
              <Text style={styles.driverName}>{driverName}</Text>
            </View>

            <View>
              <Text style={styles.route}>{route}</Text>
              <Text style={styles.startedAt}>
                Started {startedAt}
              </Text>
            </View>
          </View>

          <Pressable style={styles.trackButton}>
            <Text style={styles.trackButtonText}>
              Track Bus
            </Text>
          </Pressable>
        </>
      ) : (
        <Text style={styles.emptyText}>
          No active bus route.
        </Text>
      )}
    </View>
  );
}