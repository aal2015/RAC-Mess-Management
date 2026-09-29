import { View, Text, Pressable, ScrollView } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { styles } from "../../user/styles/booking.styles";

export default function BookingScreen() {
    const { date } = useLocalSearchParams<{ date: string }>();

    const [lunch, setLunch] = useState(true);
    const [dinner, setDinner] = useState(true);

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.contentContainer}
        >
            <View style={styles.header}>
                <Text style={styles.title}>Meal Booking</Text>
                <Text style={styles.date}>{date}</Text>
            </View>

            <View style={styles.card}>
                <Text style={styles.label}>Lunch</Text>

                <View style={styles.toggleRow}>
                    <Pressable
                        style={[
                            styles.option,
                            lunch && styles.takingActive,
                        ]}
                        onPress={() => setLunch(true)}
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
                        onPress={() => setLunch(false)}
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

                <Text style={styles.label}>Dinner</Text>

                <View style={styles.toggleRow}>
                    <Pressable
                        style={[
                            styles.option,
                            dinner && styles.takingActive,
                        ]}
                        onPress={() => setDinner(true)}
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
                        onPress={() => setDinner(false)}
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

                <Text style={styles.cutoffText}>
                    This can be changed until the cutoff. After that, tomorrow’s
                    meal count is locked in for the mess.
                </Text>


                <Pressable style={styles.confirmButton}>
                    <Text style={styles.confirmText}>Confirm</Text>
                </Pressable>
            </View>
        </ScrollView>
    );
}