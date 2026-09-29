import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F8FAFC",
    },

    header: {
        backgroundColor: "#0F2A4A",
        paddingHorizontal: 24,
        paddingVertical: 28,
    },

    title: {
        fontSize: 28,
        fontWeight: "700",
        color: "#FFFFFF",
    },

    month: {
        fontSize: 16,
        color: "#D1D5DB",
        marginTop: 8,
    },

    content: {
        width: "100%",
        maxWidth: 1000,
        alignSelf: "center",
        padding: 24,
    },

    calendarPlaceholder: {
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: "#E5E7EB",
        borderRadius: 12,
        minHeight: 300,
        alignItems: "center",
        justifyContent: "center",
    },

    placeholderText: {
        fontSize: 16,
        color: "#6B7280",
    },

    totalSection: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",

        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: "#D1D5DB",
        borderRadius: 12,

        paddingHorizontal: 20,
        paddingVertical: 16,

        marginTop: 24,
    },

    totalLabel: {
        fontSize: 16,
        fontWeight: "500",
        color: "#374151",
    },

    totalValue: {
        fontSize: 18,
        fontWeight: "700",
        color: "#111827",
    },
});