import { View, Text, ScrollView, Pressable } from "react-native";
import { useAuth } from "../../auth/AuthContext";
import { styles } from "../styles/adminHome.styles";

export default function AdminHomeScreen() {
    const { user, logout } = useAuth();

    function getGreeting() {
        const hour = new Date().getHours();

        if (hour >= 5 && hour < 12) {
            return "Good Morning";
        }

        if (hour >= 12 && hour < 17) {
            return "Good Afternoon";
        }

        return "Good Evening";
    }

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.contentContainer}
        >
            <View style={styles.header}>
                <Text style={styles.greeting}>
                    {getGreeting()}, {user?.name}
                </Text>

                <Text style={styles.userInfo}>
                    {user?.username} • Administrator
                </Text>
            </View>

            <View style={styles.content}>
                <Text style={styles.sectionTitle}>
                    Today's Overview
                </Text>

                <View style={styles.statsGrid}>
                    <View style={styles.statCard}>
                        <Text style={styles.statLabel}>
                            Lunch
                        </Text>

                        <Text style={styles.statValue}>
                            42 / 50
                        </Text>

                        <Text style={styles.statDescription}>
                            meals booked
                        </Text>
                    </View>

                    <View style={styles.statCard}>
                        <Text style={styles.statLabel}>
                            Dinner
                        </Text>

                        <Text style={styles.statValue}>
                            38 / 50
                        </Text>

                        <Text style={styles.statDescription}>
                            meals booked
                        </Text>
                    </View>

                    <View style={styles.statCard}>
                        <Text style={styles.statLabel}>
                            Active Buses
                        </Text>

                        <Text style={styles.statValue}>
                            3
                        </Text>

                        <Text style={styles.statDescription}>
                            currently active
                        </Text>
                    </View>

                    <View style={styles.statCard}>
                        <Text style={styles.statLabel}>
                            Users
                        </Text>

                        <Text style={styles.statValue}>
                            50
                        </Text>

                        <Text style={styles.statDescription}>
                            registered users
                        </Text>
                    </View>
                </View>

                <Text style={styles.sectionTitle}>
                    Quick Actions
                </Text>

                <View style={styles.actionCard}>
                    <Pressable style={styles.actionButton}>
                        <Text style={styles.actionText}>
                            Manage Bookings
                        </Text>
                    </Pressable>

                    <Pressable style={styles.actionButton}>
                        <Text style={styles.actionText}>
                            Manage Users
                        </Text>
                    </Pressable>

                    <Pressable style={styles.actionButton}>
                        <Text style={styles.actionText}>
                            Manage Buses
                        </Text>
                    </Pressable>

                    <Pressable style={styles.actionButton}>
                        <Text style={styles.actionText}>
                            View Directory
                        </Text>
                    </Pressable>
                </View>

                {/* <Pressable
                    style={styles.logoutButton}
                    onPress={logout}
                >
                    <Text style={styles.logoutText}>
                        Logout
                    </Text>
                </Pressable> */}
            </View>
        </ScrollView>
    );
}