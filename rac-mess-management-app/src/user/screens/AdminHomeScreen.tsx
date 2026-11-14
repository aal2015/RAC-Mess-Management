import { View, Text, ScrollView, Pressable } from "react-native";
import { useAuth } from "../../auth/AuthContext";
import ScreenHeader from '../../components/ScreenHeader'
import { styles } from "../styles/adminHome.styles";

export default function AdminHomeScreen() {
    const { user } = useAuth();

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.contentContainer}
        >
            <ScreenHeader
                name={user?.name}
                subtitle={`${user?.username ?? "-"} • ${user?.battalion ?? "-"}`}
                showGreeting
            />

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