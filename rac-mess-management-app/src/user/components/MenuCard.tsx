import { View, Text } from "react-native";
import { styles } from "../styles/home.styles";

type MenuCardProps = {
  title: string;
  items?: string;
  status?: "Taken" | "Pending";
};

export default function MenuCard({
  title,
  items,
  status,
}: MenuCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{title}</Text>

        {status && (
          <View
            style={[
              styles.statusBadge,
              status === "Taken"
                ? styles.takenBadge
                : styles.pendingBadge,
            ]}
          >
            <Text
              style={[
                styles.statusText,
                status === "Taken"
                  ? styles.takenText
                  : styles.pendingText,
              ]}
            >
              {status}
            </Text>
          </View>
        )}
      </View>

      {items ? (
        <Text style={styles.menuItem}>{items}</Text>
      ) : (
        <Text style={styles.emptyText}>
          No menu for this day.
        </Text>
      )}
    </View>
  );
}