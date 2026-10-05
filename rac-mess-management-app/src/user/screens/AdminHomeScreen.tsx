import { View, Text, ScrollView, Pressable } from "react-native";
import { useAuth } from "../../auth/AuthContext";
import LogoutButton from "../../components/LogoutButton";
import { styles } from "../styles/adminHome.styles";

export default function AdminHomeScreen() {
    const { user } = useAuth();

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
                <View style={styles.headerText}>
                    <Text style={styles.greeting}>
                        {getGreeting()}, {user?.name}
                    </Text>

                    <Text style={styles.userInfo}>
                        {user?.username} • Administrator
                    </Text>
                </View>

                <LogoutButton />
            </View>

            <View style={styles.content}>
                {/* Dashboard statistics and quick actions
                    will be added in a future update. */}

                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>
                        Admin Dashboard
                    </Text>

                    <Text>
                        Management features coming soon.
                    </Text>
                </View>
            </View>
        </ScrollView>
    );
}