import { Pressable, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../auth/AuthContext";

export default function LogoutButton() {
    const { logout } = useAuth();

    return (
        <Pressable
            style={styles.button}
            onPress={logout}
        >
            <Ionicons
                name="log-out-outline"
                size={22}
                color="#FFFFFF"
            />

            <Text style={styles.text}>Logout</Text>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    button: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,

        paddingHorizontal: 12,
        paddingVertical: 8,

        borderWidth: 1,
        borderColor: "#FFFFFF",
        borderRadius: 6,

        backgroundColor: "transparent",
    },

    text: {
        color: "#FFFFFF",
        fontSize: 14,
        fontWeight: "600",
    },
});