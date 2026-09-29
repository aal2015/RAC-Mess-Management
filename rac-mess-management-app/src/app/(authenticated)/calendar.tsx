import { View, Text } from "react-native";
import { styles } from "../../user/styles/calendar.styles";

export default function CalendarScreen() {
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Diet Calendar</Text>

                <Text style={styles.month}>
                    September 2026
                </Text>
            </View>

            <View style={styles.content}>
                <View style={styles.calendarPlaceholder}>
                    <Text style={styles.placeholderText}>
                        Calendar coming soon
                    </Text>
                </View>

                <View style={styles.totalSection}>
                    <Text style={styles.totalLabel}>
                        September Total
                    </Text>

                    <Text style={styles.totalValue}>
                        51 diets
                    </Text>
                </View>
            </View>
        </View>
    );
}