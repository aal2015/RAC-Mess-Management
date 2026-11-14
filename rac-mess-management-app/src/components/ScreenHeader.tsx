
import { View, Text, StyleSheet } from "react-native";
import LogoutButton from "./LogoutButton";

type ScreenHeaderProps = {
    title?: string;
    name?: string | null;
    subtitle?: string;
    showGreeting?: boolean;
};

function getGreeting() {
    const hour = new Date().getHours();

    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
}

export default function ScreenHeader({
    title,
    name,
    subtitle,
    showGreeting = false,
}: ScreenHeaderProps) {
    return (
        <View style={styles.header}>
            <View style={styles.headerText}>
                {showGreeting ? (
                    <>
                        <Text style={styles.greeting}>
                            {getGreeting()}, {name}
                        </Text>

                        {subtitle && (
                            <Text style={styles.userInfo}>
                                {subtitle}
                            </Text>
                        )}
                    </>
                ) : (
                    <Text style={styles.title}>{title}</Text>
                )}
            </View>

            <LogoutButton />
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#0F2A4A",
        paddingHorizontal: 24,
        paddingVertical: 28,
    },

    headerText: {
        flex: 1,
    },

    greeting: {
        fontSize: 28,
        fontWeight: "700",
        color: "#FFFFFF",
    },

    userInfo: {
        fontSize: 15,
        color: "#D1D5DB",
        marginTop: 8,
    },

    title: {
        fontSize: 24,
        fontWeight: "700",
        color: "#FFFFFF",
    },
});
