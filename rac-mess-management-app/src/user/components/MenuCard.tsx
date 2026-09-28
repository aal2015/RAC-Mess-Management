import { View, Text } from "react-native";
import { styles } from "../styles/home.styles";

type MenuCardProps = {
  title: string;
  items?: string;
};

export default function MenuCard({
  title,
  items,
}: MenuCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{title}</Text>

      {items ? (
        <Text style={styles.menuItem}>
          {items}
        </Text>
      ) : (
        <Text style={styles.emptyText}>
          No menu for this day.
        </Text>
      )}
    </View>
  );
}