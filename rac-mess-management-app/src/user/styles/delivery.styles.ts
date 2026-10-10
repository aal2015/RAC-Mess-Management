import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F8FAFC",
    },

    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",

        backgroundColor: "#0F2A4A",
        paddingHorizontal: 24,
        paddingVertical: 28,
    },

    title: {
        fontSize: 28,
        fontWeight: "700",
        color: "#FFFFFF",
    },

    content: {
        width: "100%",
        maxWidth: 1000,
        alignSelf: "center",
        padding: 24,
    },
});