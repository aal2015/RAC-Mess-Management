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

    content: {
        width: "100%",
        maxWidth: 1000,
        alignSelf: "center",
        padding: 24,
    },

    sectionTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: "#111827",
        marginBottom: 16,
        marginTop: 8,
    },

    statsGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 16,
    },

    statCard: {
        flexGrow: 1,
        flexBasis: 200,
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: "#E5E7EB",
        borderRadius: 12,
        padding: 20,
    },

    statLabel: {
        fontSize: 14,
        fontWeight: "600",
        color: "#6B7280",
    },

    statValue: {
        fontSize: 28,
        fontWeight: "700",
        color: "#111827",
        marginTop: 8,
    },

    statDescription: {
        fontSize: 13,
        color: "#6B7280",
        marginTop: 4,
    },

    actionCard: {
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: "#E5E7EB",
        borderRadius: 12,
        padding: 16,
    },

    actionButton: {
        height: 48,
        borderWidth: 1,
        borderColor: "#D1D5DB",
        borderRadius: 8,
        justifyContent: "center",
        paddingHorizontal: 16,
        marginBottom: 10,
    },

    actionText: {
        fontSize: 15,
        fontWeight: "600",
        color: "#0F2A4A",
    },

    logoutButton: {
        marginTop: 24,
        height: 48,
        borderRadius: 8,
        backgroundColor: "#DC2626",
        justifyContent: "center",
        alignItems: "center",
    },

    logoutText: {
        color: "#FFFFFF",
        fontSize: 15,
        fontWeight: "600",
    },
});