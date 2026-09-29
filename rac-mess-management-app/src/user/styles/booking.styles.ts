import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F8FAFC",
    },

    contentContainer: {
        flexGrow: 1,
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

    date: {
        color: "#D1D5DB",
        marginTop: 8,
        fontSize: 16,
    },

    card: {
        backgroundColor: "#FFFFFF",
        margin: 20,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        padding: 20,
    },

    label: {
        fontSize: 18,
        fontWeight: "600",
        marginBottom: 12,
        color: "#111827",
    },

    toggleRow: {
        flexDirection: "row",
        gap: 12,
        marginBottom: 24,
    },

    option: {
        flex: 1,
        height: 48,
        borderRadius: 8,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#D1D5DB",
        backgroundColor: "#FFFFFF",
    },

    takingActive: {
        backgroundColor: "#16A34A",
        borderColor: "#16A34A",
    },

    notTakingActive: {
        backgroundColor: "#DC2626",
        borderColor: "#DC2626",
    },

    optionText: {
        color: "#374151",
        fontWeight: "600",
    },

    whiteText: {
        color: "#FFFFFF",
    },

    confirmButton: {
        backgroundColor: "#2563EB",
        height: 52,
        borderRadius: 8,
        justifyContent: "center",
        alignItems: "center",
    },

    confirmText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "700",
    },

    cutoffText: {
        fontSize: 13,
        lineHeight: 19,
        color: "#6B7280",
        marginBottom: 16,
    },
});