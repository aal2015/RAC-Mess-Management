import { View, Text, Button, useWindowDimensions, ScrollView } from "react-native";
import { useAuth } from "../../auth/AuthContext";
import LogoutButton from "../../components/LogoutButton";
import BusCard from "../components/BusCard";
import { styles } from "../styles/adminHome.styles";

export default function DiverHomeScreen() {
    const { width } = useWindowDimensions();
    const { user, logout } = useAuth();

    const isMobile = width < 768;

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
                        {user?.username} • {user?.battalion ?? "-"}
                    </Text>
                </View>

                <LogoutButton />
            </View>

            <View style={styles.content}>
                {/* Dashboard statistics and quick actions
                                will be added in a future update. */}

                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>
                        Diver Dashboard
                    </Text>

                    <Text>
                        Content coming up
                    </Text>
                </View>
            </View>
        </ScrollView>
    );
}