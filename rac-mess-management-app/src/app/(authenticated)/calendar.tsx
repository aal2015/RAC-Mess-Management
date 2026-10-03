import { View, Text, ScrollView } from "react-native";
import { styles } from "../../user/styles/calendar.styles";
import CalendarGrid from "../../user/components/CalendarGrid";
import { useLocalSearchParams } from "expo-router";

export default function CalendarScreen() {
    const { userId } = useLocalSearchParams<
        "/(authenticated)/calendar",
        { userId?: string }
    >();

    console.log("User ID:", userId);

    
    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Diet Calendar</Text>

                <Text style={styles.month}>
                    September 2026
                </Text>
            </View>

            <View style={styles.content}>
                <CalendarGrid month={8} year={2026} />

                <View style={styles.legend}>
                    <View style={styles.legendItem}>
                        <View style={[styles.legendBox, styles.fullMeal]} />
                        <Text style={styles.legendText}>2 meals</Text>
                    </View>

                    <View style={styles.legendItem}>
                        <View style={[styles.legendBox, styles.partialMeal]} />
                        <Text style={styles.legendText}>1 meal</Text>
                    </View>

                    <View style={styles.legendItem}>
                        <View style={[styles.legendBox, styles.noMeal]} />
                        <Text style={styles.legendText}>0 meals</Text>
                    </View>
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
        </ScrollView>
    );
}